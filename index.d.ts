import { ChangeEvent, ReactNode } from "react";

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
