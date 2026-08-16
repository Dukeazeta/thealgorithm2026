import type {
  ContentStatus,
  GalleryCategory,
  SubmissionStatus,
} from "@/db/schema";

export type GraduateProfile = {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  imageSrc: string;
  alt: string;
  dob: string;
  favouriteColour: string;
  adviceToYoungerLevel: string;
  skillsHobbies: string;
  favoriteLecturer: string;
  favoriteLevel: string;
  worstLevel: string;
  departmentFriends: string[];
  favouriteQuote: string;
  ifNotComputerScience: string;
  stayOrJapa: string;
  status?: ContentStatus;
  sortOrder?: number;
};

export type GraduateExtraction = Omit<
  GraduateProfile,
  "id" | "imageSrc" | "status" | "sortOrder"
>;

export type GalleryItem = {
  id: string;
  slug: string;
  title: string;
  category: GalleryCategory;
  year: string;
  location: string;
  imageSrc: string;
  alt: string;
  caption: string;
  tag: string;
  featured?: boolean;
  status?: ContentStatus;
  sortOrder?: number;
};

export type StoryChapter = {
  id: string;
  slug: string;
  year: string;
  level: string;
  title: string;
  eyebrow: string;
  headline: string;
  narrative: string[];
  keyCourses: string[];
  definingMoment: string;
  quote: {
    text: string;
    author: string;
  };
  tone: "forest" | "slate" | "stone" | "dark";
  status?: ContentStatus;
  sortOrder?: number;
};

export type StoryMemory = {
  id: string;
  category: string;
  title: string;
  snippet: string;
  author: string;
};

export type StoryStat = {
  id: string;
  label: string;
  value: string;
};

export type StoryPayload = {
  chapters: StoryChapter[];
  memories: StoryMemory[];
  stats: StoryStat[];
};

export type MemorySubmission = {
  id: string;
  contributorName: string;
  category: GalleryCategory;
  title: string;
  caption: string;
  imageSrc: string | null;
  status: SubmissionStatus;
  reviewNotes: string | null;
  createdAt: string;
};
