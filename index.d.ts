import { ReactNode } from "react";

// ✅ only once
type VideoFormValues = {
  title: string;
  description: string;
  tags: string;
  visibility: "public" | "private";
};

// ✅ keep once
declare interface SharedHeaderProps {
  subHeader: string;
  title: string;
  userImg?: string;
}

// ✅ keep once
declare interface ExtendedMediaStream extends MediaStream {
  _originalStreams?: MediaStream[];
}

// ✅ fixed Next.js params (no Promises)
declare interface Params {
  params: Record<string, string>;
}

declare interface SearchParams {
  searchParams: Record<string, string | undefined>;
}

declare interface ParamsWithSearch {
  params: Record<string, string>;
  searchParams: Record<string, string | undefined>;
}

// ✅ fix ReactNode import
declare interface DropdownListProps {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  triggerElement: ReactNode;
}

declare interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

type Visibility = "public" | "private";

declare interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  userImg: string;
  username: string;
  createdAt: Date;
  views: number;
  visibility: Visibility;
  duration?: number | null;
}

declare interface VideoPlayerProps {
  videoId: string;
  className?: string;
}

declare interface VideoDetailHeaderProps {
  title: string;
  createdAt: Date;
  userImg?: string;
  username?: string;
  videoId: string;
  ownerId: string;
  visibility: Visibility;
  thumbnailUrl: string;
}

declare interface PaginationProps {
  currentPage: number;
  totalPages: number;
  queryString?: string;
  filterString?: string;
}

declare interface VideoInfoProps {
  transcript: string;
  title: string;
  createdAt: Date;
  description: string;
  videoId: string;
  videoUrl: string;
}

declare type BunnyRecordingState = {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordedVideoUrl: string;
  recordingDuration: number;
};

declare interface RecordingHandlers {
  onDataAvailable: (event: BlobEvent) => void;
  onStop: () => void;
}

declare interface MediaStreams {
  displayStream: MediaStream;
  micStream: MediaStream | null;
  hasDisplayAudio: boolean;
}

declare interface TranscriptEntry {
  time: string;
  text: string;
}

declare interface ApiFetchOptions {
  method?: "GET" | "POST" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  expectJson?: boolean;
}

declare interface VideoDetails {
  title: string;
  description: string;
  tags: string;
  visibility: Visibility;
  videoId: string;
  thumbnailUrl: string;
  duration?: number | null;
}

declare interface BunnyVideoResponse {
  guid: string;
  status: number;
  encodeProgress?: number;
}
