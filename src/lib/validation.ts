import { z } from "zod";
import { galleryCategories } from "@/db/schema";

export const galleryCategorySchema = z.enum(galleryCategories);

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(200),
});

export const memorySubmissionSchema = z.object({
  contributorName: z.string().trim().min(2).max(80),
  category: galleryCategorySchema,
  title: z.string().trim().min(2).max(160),
  caption: z.string().trim().min(10).max(5000),
});

export const graduateSchema = z.object({
  slug: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(160),
  nickname: z.string().trim().min(1).max(100),
  mediaAssetId: z.string().uuid().nullable().optional(),
  alt: z.string().trim().min(2).max(240),
  dob: z.string().trim().min(2).max(80),
  favouriteColour: z.string().trim().min(2).max(160),
  adviceToYoungerLevel: z.string().trim().min(2).max(1000),
  skillsHobbies: z.string().trim().min(2).max(500),
  favoriteLecturer: z.string().trim().min(1).max(160),
  favoriteLevel: z.string().trim().min(1).max(80),
  worstLevel: z.string().trim().min(1).max(80),
  departmentFriends: z.array(z.string().trim().min(1).max(100)).max(30),
  favouriteQuote: z.string().trim().min(2).max(1000),
  ifNotComputerScience: z.string().trim().min(2).max(200),
  stayOrJapa: z.string().trim().min(1).max(100),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(0).max(100000),
});

export const galleryItemSchema = z.object({
  slug: z.string().trim().min(2).max(100),
  title: z.string().trim().min(2).max(200),
  category: galleryCategorySchema,
  year: z.string().trim().min(4).max(20),
  location: z.string().trim().min(2).max(200),
  mediaAssetId: z.string().uuid(),
  alt: z.string().trim().min(2).max(240),
  caption: z.string().trim().min(10).max(5000),
  tag: z.string().trim().min(2).max(100),
  featured: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(0).max(100000),
});

export const storyChapterSchema = z.object({
  slug: z.string().trim().min(2).max(100),
  year: z.string().trim().min(4).max(40),
  level: z.string().trim().min(2).max(100),
  title: z.string().trim().min(2).max(200),
  eyebrow: z.string().trim().min(2).max(200),
  headline: z.string().trim().min(2).max(500),
  narrative: z.array(z.string().trim().min(2).max(3000)).min(1).max(12),
  keyCourses: z.array(z.string().trim().min(2).max(200)).max(20),
  definingMoment: z.string().trim().min(2).max(1000),
  quoteText: z.string().trim().min(2).max(1000),
  quoteAuthor: z.string().trim().min(2).max(160),
  tone: z.enum(["forest", "slate", "stone", "dark"]),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(0).max(100000),
});

export const storyMemorySchema = z.object({
  category: z.string().trim().min(2).max(100),
  title: z.string().trim().min(2).max(200),
  snippet: z.string().trim().min(2).max(1500),
  author: z.string().trim().min(2).max(160),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(0).max(100000),
});

export const storyStatSchema = z.object({
  label: z.string().trim().min(2).max(160),
  value: z.string().trim().min(1).max(80),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().min(0).max(100000),
});

export type MemorySubmissionInput = z.infer<typeof memorySubmissionSchema>;
export type GraduateInput = z.infer<typeof graduateSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type StoryChapterInput = z.infer<typeof storyChapterSchema>;
export type StoryMemoryInput = z.infer<typeof storyMemorySchema>;
export type StoryStatInput = z.infer<typeof storyStatSchema>;
