import { redirect } from "next/navigation";

import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import { getTranscript, getVideoById } from "@/lib/actions/video";

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolvedParams = await params;
  const { videoId } = resolvedParams;

  const { user, video } = await getVideoById(videoId);
  if (!video) redirect("/404");

  const transcript = await getTranscript(videoId);

  return (
    <main className="wrapper page">
      <VideoDetailHeader
        title={video.title}
        createdAt={video.createdAt}
        userImg={user?.image ?? undefined}
        username={user?.name ?? undefined}
        videoId={video.videoId}
        ownerId={video.userId}
        visibility={video.visibility}
        thumbnailUrl={video.thumbnailUrl}
      />

      <section className="video-details">
        <div className="content">
          <VideoPlayer videoId={video.videoId} />
        </div>

        <VideoInfo
          transcript={transcript}
          title={video.title}
          createdAt={video.createdAt}
          description={video.description}
          videoUrl={video.videoUrl}
        />
      </section>
    </main>
  );
}
