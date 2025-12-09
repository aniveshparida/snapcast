"use server";

import { db } from "@/drizzle/db";
import { videos, user } from "@/drizzle/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {apiFetch, doesTitleMatch, getEnv, getOrderByClause, withErrorHandling} from "@/lib/utils";
import { BUNNY } from "@/constants";
import aj, { fixedWindow, request } from "@/lib/arcjet";

type Visibility = "public" | "private";
type BunnyVideoResponse = { guid: string; status: number; encodeProgress?: number };
type VideoDetails = {
  title: string;
  description: string;
  tags: string;
  visibility: Visibility;
  videoId: string;
  thumbnailUrl: string;
  duration?: number | null;
};

// Lazy config accessor to avoid evaluating env at module-load/build time
const getBunnyConfig = () => {
  return {
    VIDEO_STREAM_BASE_URL: BUNNY.STREAM_BASE_URL,
    THUMBNAIL_STORAGE_BASE_URL: BUNNY.STORAGE_BASE_URL,
    THUMBNAIL_CDN_URL: BUNNY.CDN_URL,
    BUNNY_LIBRARY_ID: getEnv("BUNNY_LIBRARY_ID"),
    ACCESS_KEYS: {
      streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
      storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
    },
  };
};

const validateWithArcjet = async (fingerPrint: string) => {
  const rateLimit = aj.withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 2,
      characteristics: ["fingerprint"],
    })
  );
  const req = await request();
  const decision = await rateLimit.protect(req, { fingerprint: fingerPrint });
  if (decision.isDenied()) {
    throw new Error("Rate Limit Exceeded");
  }
};

// Helper functions with descriptive names
const revalidatePaths = (paths: string[]) => {
  paths.forEach((path) => revalidatePath(path));
};

const getSessionUserId = async (): Promise<string> => {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    console.log("[DEBUG] Session retrieved:", session?.user?.id);
    if (!session) {
      console.error("[DEBUG] No session found in headers");
      throw new Error("Unauthenticated");
    }
    return session.user.id;
  } catch (error) {
    console.error("[DEBUG] getSessionUserId error:", error);
    throw error;
  }
};

const buildVideoWithUserQuery = () =>
  db
    .select({
      video: videos,
      user: { id: user.id, name: user.name, image: user.image },
    })
    .from(videos)
    .leftJoin(user, eq(videos.userId, user.id));

// Server Actions
export const getVideoUploadUrl = withErrorHandling(async () => {
  try {
    const headersList = await headers();
    console.log('[DEBUG] getVideoUploadUrl headers keys:', Array.from(headersList.keys()));
    const session = await auth.api.getSession({ headers: headersList });
    console.log('[DEBUG] getVideoUploadUrl session:', session?.user?.id);
    if (!session) throw new Error('Unauthenticated');
  } catch (err) {
    console.error('[DEBUG] getVideoUploadUrl failed to read session:', err);
    throw err;
  }
  
  const {
    VIDEO_STREAM_BASE_URL,
    BUNNY_LIBRARY_ID,
    ACCESS_KEYS,
  } = getBunnyConfig();

  const videoResponse = await apiFetch<BunnyVideoResponse>(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: "POST",
      bunnyType: "stream",
      body: { title: "Temp Title", collectionId: "" },
    }
  );

  const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;
  return {
    videoId: videoResponse.guid,
    uploadUrl,
    accessKey: ACCESS_KEYS.streamAccessKey,
  };
});

export const getThumbnailUploadUrl = withErrorHandling(
  async (videoId: string) => {
      const { THUMBNAIL_STORAGE_BASE_URL, THUMBNAIL_CDN_URL, ACCESS_KEYS } = getBunnyConfig();
      const timestampedFileName = `${Date.now()}-${videoId}-thumbnail`;
      const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${timestampedFileName}`;
      const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${timestampedFileName}`;

      return {
        uploadUrl,
        cdnUrl,
        accessKey: ACCESS_KEYS.storageAccessKey,
      };
  }
);

export const saveVideoDetails = withErrorHandling(
  async (videoDetails: VideoDetails) => {
    try {
      console.log("[saveVideoDetails] start", {
        title: videoDetails.title,
        videoId: videoDetails.videoId,
        thumbnailUrl: videoDetails.thumbnailUrl,
        duration: videoDetails.duration,
      });

      const userId = await getSessionUserId();
      console.log("[saveVideoDetails] resolved userId", { userId });

      await validateWithArcjet(userId);

      const { VIDEO_STREAM_BASE_URL, BUNNY_LIBRARY_ID } = getBunnyConfig();
      await apiFetch(
        `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
        {
          method: "POST",
          bunnyType: "stream",
          body: {
            title: videoDetails.title,
            description: videoDetails.description,
          },
        }
      );

      const now = new Date();
      const insertResult = await db.insert(videos).values({
        ...videoDetails,
        videoUrl: `${BUNNY.EMBED_URL}/${getBunnyConfig().BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
        userId,
        createdAt: now,
        updatedAt: now,
      });

      console.log("[saveVideoDetails] db insert result", insertResult);
      revalidatePaths(["/"]);
      return { videoId: videoDetails.videoId };
    } catch (err) {
      try {
        console.error("[saveVideoDetails] ERROR", err instanceof Error ? err.message : String(err), {
          error: err,
          payload: videoDetails,
        });
      } catch (logErr) {
        console.error("[saveVideoDetails] ERROR (failed to log)", String(err));
      }
      throw err;
    }
  }
);

export const getAllVideos = withErrorHandling(async (
  searchQuery: string = '',
  sortFilter?: string,
  pageNumber: number = 1,
  pageSize: number = 8,
) => {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const currentUserId = session?.user.id ?? null;

  console.log('[getAllVideos] session keys:', session ? Object.keys(session) : null, 'currentUserId:', currentUserId);

  const canSeeTheVideos = currentUserId
    ? or(eq(videos.visibility, 'public'), eq(videos.userId, currentUserId))
    : eq(videos.visibility, 'public');

  const whereCondition = searchQuery.trim()
      ? and(
          canSeeTheVideos,
          doesTitleMatch(videos, searchQuery),
      )
      : canSeeTheVideos

    // Count total for pagination
    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)` })
      .from(videos)
      .where(whereCondition);
    const totalVideos = Number(totalCount || 0);
    const totalPages = Math.ceil(totalVideos / pageSize);

    // Fetch paginated, sorted results
    const videoRecords = await buildVideoWithUserQuery()
      .where(whereCondition)
      .orderBy(
        sortFilter
          ? getOrderByClause(sortFilter)
          : sql`${videos.createdAt} DESC`
      )
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    return {
      videos: videoRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalVideos,
        pageSize,
      },
    };
  }
);

export const getVideoById = withErrorHandling(async (videoId: string) => {
  const [videoRecord] = await buildVideoWithUserQuery().where(
    eq(videos.videoId, videoId)
  );
  return videoRecord;
});

export const getTranscript = withErrorHandling(async (videoId: string) => {
  const response = await fetch(
    `${BUNNY.TRANSCRIPT_URL}/${videoId}/captions/en-auto.vtt`
  );
  return response.text();
});

export const incrementVideoViews = withErrorHandling(
  async (videoId: string) => {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1`, updatedAt: new Date() })
      .where(eq(videos.videoId, videoId));

    revalidatePaths([`/video/${videoId}`]);
    return {};
  }
);

export const getAllVideosByUser = withErrorHandling(
  async (
    userIdParameter: string,
    searchQuery: string = "",
    sortFilter?: string
  ) => {
    const headersList = await headers();
    const currentUserId = (
      await auth.api.getSession({ headers: headersList })
    )?.user.id;
    const isOwner = userIdParameter === currentUserId;

    const [userInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userIdParameter));
    if (!userInfo) throw new Error("User not found");

        /* eslint-disable @typescript-eslint/no-explicit-any */
    const conditions = [
      eq(videos.userId, userIdParameter),
      !isOwner && eq(videos.visibility, "public"),
      searchQuery.trim() && ilike(videos.title, `%${searchQuery}%`),
    ].filter(Boolean) as any[];

    const userVideos = await buildVideoWithUserQuery()
      .where(and(...conditions))
      .orderBy(
        sortFilter ? getOrderByClause(sortFilter) : desc(videos.createdAt)
      );

    return { user: userInfo, videos: userVideos, count: userVideos.length };
  }
);

export const updateVideoVisibility = withErrorHandling(
  async (videoId: string, visibility: Visibility) => {
    await validateWithArcjet(videoId);
    await db
      .update(videos)
      .set({ visibility, updatedAt: new Date() })
      .where(eq(videos.videoId, videoId));

    revalidatePaths(["/", `/video/${videoId}`]);
    return {};
  }
);

export const getVideoProcessingStatus = withErrorHandling(
  async (videoId: string) => {
    const processingInfo = await apiFetch<BunnyVideoResponse>(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      { bunnyType: "stream" }
    );

    return {
      isProcessed: processingInfo.status === 4,
      encodingProgress: processingInfo.encodeProgress || 0,
      status: processingInfo.status,
    };
  }
);

export const deleteVideo = withErrorHandling(
  async (videoId: string, thumbnailUrl: string) => {
    await apiFetch(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      { method: "DELETE", bunnyType: "stream" }
    );

    const thumbnailPath = thumbnailUrl.split("thumbnails/")[1];
    await apiFetch(
      `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${thumbnailPath}`,
      { method: "DELETE", bunnyType: "storage", expectJson: false }
    );

    await db.delete(videos).where(eq(videos.videoId, videoId));
    revalidatePaths(["/", `/video/${videoId}`]);
    return {};
  }
);
