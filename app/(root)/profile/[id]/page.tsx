import { redirect } from "next/navigation";

import { getAllVideosByUser } from "@/lib/actions/video";
import EmptyState from "@/components/EmptyState";
import SharedHeader from "@/components/SharedHeader";
import VideoCard from "@/components/VideoCard";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { id } = resolvedParams;
  const { query, filter } = resolvedSearchParams;

  const { user, videos } = await getAllVideosByUser(id, query, filter);
  if (!user) redirect("/404");

  return (
    <main className="wrapper page">
      <SharedHeader
        subHeader={user?.email}
        title={user?.name}
        userImg={user?.image ?? ""}
      />

      {videos?.length > 0 ? (
        <section className="video-grid">
          {videos.map(({ video }) => (
            <VideoCard
              key={video.id}
              id={video.videoId}
              title={video.title}
              thumbnail={video.thumbnailUrl}
              createdAt={video.createdAt}
              userImg={user.image ?? ""}
              username={user.name ?? "Guest"}
              views={video.views}
              visibility={video.visibility}
              duration={video.duration}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="/assets/icons/video.svg"
          title="No Videos Available Yet"
          description="Video will show up here once you upload them."
        />
      )}
    </main>
  );
}
