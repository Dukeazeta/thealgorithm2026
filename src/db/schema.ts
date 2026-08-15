import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const contentStatuses = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export const submissionStatuses = ["pending", "approved", "rejected"] as const;
export type SubmissionStatus = (typeof submissionStatuses)[number];

export const galleryCategories = [
  "Class",
  "Campus",
  "Labs",
  "Celebrations",
] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export const mediaStatuses = ["ready", "deleted"] as const;
export type MediaStatus = (typeof mediaStatuses)[number];

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`);

const updatedAt = () =>
  text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`);

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("admin"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("admin_users_email_idx").on(table.email)],
);

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    revokedAt: text("revoked_at"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("admin_sessions_token_hash_idx").on(table.tokenHash),
    index("admin_sessions_user_idx").on(table.adminUserId),
  ],
);

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    blobUrl: text("blob_url").notNull(),
    blobPathname: text("blob_pathname").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"),
    status: text("status").$type<MediaStatus>().notNull().default("ready"),
    createdAt: createdAt(),
  },
  (table) => [index("media_assets_status_idx").on(table.status)],
);

export const graduates = sqliteTable(
  "graduates",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    nickname: text("nickname").notNull(),
    mediaAssetId: text("media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    alt: text("alt").notNull(),
    dob: text("dob").notNull(),
    favouriteColour: text("favourite_colour").notNull(),
    adviceToYoungerLevel: text("advice_to_younger_level").notNull(),
    skillsHobbies: text("skills_hobbies").notNull(),
    favoriteLecturer: text("favorite_lecturer").notNull(),
    favoriteLevel: text("favorite_level").notNull(),
    worstLevel: text("worst_level").notNull(),
    departmentFriends: text("department_friends").notNull().default("[]"),
    favouriteQuote: text("favourite_quote").notNull(),
    ifNotComputerScience: text("if_not_computer_science").notNull(),
    stayOrJapa: text("stay_or_japa").notNull(),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("graduates_slug_idx").on(table.slug),
    index("graduates_status_order_idx").on(table.status, table.sortOrder),
  ],
);

export const galleryItems = sqliteTable(
  "gallery_items",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").$type<GalleryCategory>().notNull(),
    year: text("year").notNull(),
    location: text("location").notNull(),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    alt: text("alt").notNull(),
    caption: text("caption").notNull(),
    tag: text("tag").notNull(),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("gallery_items_slug_idx").on(table.slug),
    index("gallery_items_public_order_idx").on(
      table.status,
      table.category,
      table.sortOrder,
    ),
  ],
);

export const storyChapters = sqliteTable(
  "story_chapters",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    year: text("year").notNull(),
    level: text("level").notNull(),
    title: text("title").notNull(),
    eyebrow: text("eyebrow").notNull(),
    headline: text("headline").notNull(),
    narrative: text("narrative").notNull().default("[]"),
    keyCourses: text("key_courses").notNull().default("[]"),
    definingMoment: text("defining_moment").notNull(),
    quoteText: text("quote_text").notNull(),
    quoteAuthor: text("quote_author").notNull(),
    tone: text("tone").notNull(),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("story_chapters_slug_idx").on(table.slug),
    index("story_chapters_status_order_idx").on(table.status, table.sortOrder),
  ],
);

export const storyMemories = sqliteTable(
  "story_memories",
  {
    id: text("id").primaryKey(),
    category: text("category").notNull(),
    title: text("title").notNull(),
    snippet: text("snippet").notNull(),
    author: text("author").notNull(),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("story_memories_status_order_idx").on(table.status, table.sortOrder)],
);

export const storyStats = sqliteTable(
  "story_stats",
  {
    id: text("id").primaryKey(),
    label: text("label").notNull(),
    value: text("value").notNull(),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("story_stats_status_order_idx").on(table.status, table.sortOrder)],
);

export const memorySubmissions = sqliteTable(
  "memory_submissions",
  {
    id: text("id").primaryKey(),
    contributorName: text("contributor_name").notNull(),
    category: text("category").$type<GalleryCategory>().notNull(),
    title: text("title").notNull(),
    caption: text("caption").notNull(),
    mediaAssetId: text("media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    status: text("status")
      .$type<SubmissionStatus>()
      .notNull()
      .default("pending"),
    reviewNotes: text("review_notes"),
    reviewedBy: text("reviewed_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    reviewedAt: text("reviewed_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("memory_submissions_status_idx").on(table.status, table.createdAt),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: text("metadata").notNull().default("{}"),
    createdAt: createdAt(),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId)],
);

export const rateLimitBuckets = sqliteTable(
  "rate_limit_buckets",
  {
    id: text("id").primaryKey(),
    scope: text("scope").notNull(),
    fingerprint: text("fingerprint").notNull(),
    windowStartedAt: integer("window_started_at").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("rate_limit_bucket_key_idx").on(
      table.scope,
      table.fingerprint,
      table.windowStartedAt,
    ),
  ],
);
