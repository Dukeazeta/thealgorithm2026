import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  galleryItems,
  graduates,
  mediaAssets,
  memorySubmissions,
  storyChapters,
  storyMemories,
  storyStats,
} from "@/db/schema";
import type {
  GalleryItem,
  GraduateProfile,
  MemorySubmission,
  StoryChapter,
  StoryMemory,
  StoryPayload,
  StoryStat,
} from "@/lib/types";

function parseStringArray(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function toGraduate(row: {
  graduate: typeof graduates.$inferSelect;
  imageUrl: string | null;
}): GraduateProfile {
  return {
    id: row.graduate.id,
    slug: row.graduate.slug,
    name: row.graduate.name,
    nickname: row.graduate.nickname,
    imageSrc: row.imageUrl ?? "/images/graduates/duke-azeta.webp",
    alt: row.graduate.alt,
    dob: row.graduate.dob,
    favouriteColour: row.graduate.favouriteColour,
    adviceToYoungerLevel: row.graduate.adviceToYoungerLevel,
    skillsHobbies: row.graduate.skillsHobbies,
    favoriteLecturer: row.graduate.favoriteLecturer,
    favoriteLevel: row.graduate.favoriteLevel,
    worstLevel: row.graduate.worstLevel,
    departmentFriends: parseStringArray(row.graduate.departmentFriends),
    favouriteQuote: row.graduate.favouriteQuote,
    ifNotComputerScience: row.graduate.ifNotComputerScience,
    stayOrJapa: row.graduate.stayOrJapa,
    status: row.graduate.status,
    sortOrder: row.graduate.sortOrder,
  };
}

function toGalleryItem(row: {
  gallery: typeof galleryItems.$inferSelect;
  imageUrl: string | null;
}): GalleryItem {
  return {
    id: row.gallery.id,
    slug: row.gallery.slug,
    title: row.gallery.title,
    category: row.gallery.category,
    year: row.gallery.year,
    location: row.gallery.location,
    imageSrc: row.imageUrl ?? "/images/hero-bg.webp",
    alt: row.gallery.alt,
    caption: row.gallery.caption,
    tag: row.gallery.tag,
    featured: row.gallery.featured,
    status: row.gallery.status,
    sortOrder: row.gallery.sortOrder,
  };
}

function toStoryChapter(row: typeof storyChapters.$inferSelect): StoryChapter {
  return {
    id: row.id,
    slug: row.slug,
    year: row.year,
    level: row.level,
    title: row.title,
    eyebrow: row.eyebrow,
    headline: row.headline,
    narrative: parseStringArray(row.narrative),
    keyCourses: parseStringArray(row.keyCourses),
    definingMoment: row.definingMoment,
    quote: { text: row.quoteText, author: row.quoteAuthor },
    tone: row.tone as StoryChapter["tone"],
    status: row.status,
    sortOrder: row.sortOrder,
  };
}

export async function listPublishedGraduates(search?: string) {
  const normalizedSearch = search?.trim();
  const conditions = [eq(graduates.status, "published")];
  if (normalizedSearch) {
    const query = `%${normalizedSearch}%`;
    conditions.push(
      or(
        like(graduates.name, query),
        like(graduates.nickname, query),
        like(graduates.favouriteQuote, query),
        like(graduates.skillsHobbies, query),
      ) ?? eq(graduates.id, "__no_match__"),
    );
  }

  const rows = await getDatabase()
    .select({ graduate: graduates, imageUrl: mediaAssets.blobUrl })
    .from(graduates)
    .leftJoin(mediaAssets, eq(graduates.mediaAssetId, mediaAssets.id))
    .where(and(...conditions))
    .orderBy(asc(graduates.sortOrder), asc(graduates.name));

  return rows.map(toGraduate);
}

export async function getPublishedGraduate(slug: string) {
  const rows = await getDatabase()
    .select({ graduate: graduates, imageUrl: mediaAssets.blobUrl })
    .from(graduates)
    .leftJoin(mediaAssets, eq(graduates.mediaAssetId, mediaAssets.id))
    .where(and(eq(graduates.slug, slug), eq(graduates.status, "published")))
    .limit(1);

  return rows[0] ? toGraduate(rows[0]) : null;
}

export async function listPublishedGallery(options: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const conditions = [eq(galleryItems.status, "published")];
  if (options.category && options.category !== "All") {
    conditions.push(eq(galleryItems.category, options.category as typeof galleryItems.$inferSelect.category));
  }
  if (options.featured !== undefined) {
    conditions.push(eq(galleryItems.featured, options.featured));
  }

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const rows = await getDatabase()
    .select({ gallery: galleryItems, imageUrl: mediaAssets.blobUrl })
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(and(...conditions))
    .orderBy(desc(galleryItems.featured), asc(galleryItems.sortOrder), desc(galleryItems.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = rows.length > limit;
  return {
    data: rows.slice(0, limit).map(toGalleryItem),
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function getPublishedGalleryItem(slug: string) {
  const rows = await getDatabase()
    .select({ gallery: galleryItems, imageUrl: mediaAssets.blobUrl })
    .from(galleryItems)
    .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .where(and(eq(galleryItems.slug, slug), eq(galleryItems.status, "published")))
    .limit(1);

  return rows[0] ? toGalleryItem(rows[0]) : null;
}

export async function getPublishedStory(): Promise<StoryPayload> {
  const database = getDatabase();
  const [chapters, memories, stats] = await Promise.all([
    database
      .select()
      .from(storyChapters)
      .where(eq(storyChapters.status, "published"))
      .orderBy(asc(storyChapters.sortOrder), asc(storyChapters.year)),
    database
      .select()
      .from(storyMemories)
      .where(eq(storyMemories.status, "published"))
      .orderBy(asc(storyMemories.sortOrder), asc(storyMemories.createdAt)),
    database
      .select()
      .from(storyStats)
      .where(eq(storyStats.status, "published"))
      .orderBy(asc(storyStats.sortOrder), asc(storyStats.createdAt)),
  ]);

  return {
    chapters: chapters.map(toStoryChapter),
    memories: memories.map((row): StoryMemory => ({
      id: row.id,
      category: row.category,
      title: row.title,
      snippet: row.snippet,
      author: row.author,
    })),
    stats: stats.map((row): StoryStat => ({ id: row.id, label: row.label, value: row.value })),
  };
}

export async function getDashboardSnapshot() {
  const database = getDatabase();
  const [graduateCount, galleryCount, chapterCount, pendingCount] = await Promise.all([
    database.select({ value: count() }).from(graduates),
    database.select({ value: count() }).from(galleryItems),
    database.select({ value: count() }).from(storyChapters),
    database
      .select({ value: count() })
      .from(memorySubmissions)
      .where(eq(memorySubmissions.status, "pending")),
  ]);

  return {
    graduates: graduateCount[0]?.value ?? 0,
    gallery: galleryCount[0]?.value ?? 0,
    chapters: chapterCount[0]?.value ?? 0,
    pendingSubmissions: pendingCount[0]?.value ?? 0,
  };
}

export async function listPendingSubmissions(): Promise<MemorySubmission[]> {
  const rows = await getDatabase()
    .select({ submission: memorySubmissions, imageUrl: mediaAssets.blobUrl })
    .from(memorySubmissions)
    .leftJoin(mediaAssets, eq(memorySubmissions.mediaAssetId, mediaAssets.id))
    .where(eq(memorySubmissions.status, "pending"))
    .orderBy(desc(memorySubmissions.createdAt));

  return rows.map(({ submission, imageUrl }): MemorySubmission => ({
    id: submission.id,
    contributorName: submission.contributorName,
    category: submission.category,
    title: submission.title,
    caption: submission.caption,
    imageSrc: imageUrl,
    status: submission.status,
    reviewNotes: submission.reviewNotes,
    createdAt: submission.createdAt,
  }));
}

export async function listAllGraduates() {
  return getDatabase().select().from(graduates).orderBy(asc(graduates.sortOrder), asc(graduates.name));
}

export async function listAllGalleryItems() {
  return getDatabase()
    .select({ gallery: galleryItems, imageUrl: mediaAssets.blobUrl })
    .from(galleryItems)
    .leftJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
    .orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt));
}

export async function listAllStoryContent() {
  const database = getDatabase();
  return Promise.all([
    database.select().from(storyChapters).orderBy(asc(storyChapters.sortOrder)),
    database.select().from(storyMemories).orderBy(asc(storyMemories.sortOrder)),
    database.select().from(storyStats).orderBy(asc(storyStats.sortOrder)),
  ]);
}
