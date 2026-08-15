CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_token_hash_idx` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `admin_sessions_user_idx` ON `admin_sessions` (`admin_user_id`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_idx` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`year` text NOT NULL,
	`location` text NOT NULL,
	`media_asset_id` text NOT NULL,
	`alt` text NOT NULL,
	`caption` text NOT NULL,
	`tag` text NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gallery_items_slug_idx` ON `gallery_items` (`slug`);--> statement-breakpoint
CREATE INDEX `gallery_items_public_order_idx` ON `gallery_items` (`status`,`category`,`sort_order`);--> statement-breakpoint
CREATE TABLE `graduates` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`nickname` text NOT NULL,
	`media_asset_id` text,
	`alt` text NOT NULL,
	`dob` text NOT NULL,
	`favourite_colour` text NOT NULL,
	`advice_to_younger_level` text NOT NULL,
	`skills_hobbies` text NOT NULL,
	`favorite_lecturer` text NOT NULL,
	`favorite_level` text NOT NULL,
	`worst_level` text NOT NULL,
	`department_friends` text DEFAULT '[]' NOT NULL,
	`favourite_quote` text NOT NULL,
	`if_not_computer_science` text NOT NULL,
	`stay_or_japa` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `graduates_slug_idx` ON `graduates` (`slug`);--> statement-breakpoint
CREATE INDEX `graduates_status_order_idx` ON `graduates` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`blob_url` text NOT NULL,
	`blob_pathname` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt_text` text,
	`status` text DEFAULT 'ready' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_assets_status_idx` ON `media_assets` (`status`);--> statement-breakpoint
CREATE TABLE `memory_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`contributor_name` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`caption` text NOT NULL,
	`media_asset_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`review_notes` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `memory_submissions_status_idx` ON `memory_submissions` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`fingerprint` text NOT NULL,
	`window_started_at` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_bucket_key_idx` ON `rate_limit_buckets` (`scope`,`fingerprint`,`window_started_at`);--> statement-breakpoint
CREATE TABLE `story_chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`year` text NOT NULL,
	`level` text NOT NULL,
	`title` text NOT NULL,
	`eyebrow` text NOT NULL,
	`headline` text NOT NULL,
	`narrative` text DEFAULT '[]' NOT NULL,
	`key_courses` text DEFAULT '[]' NOT NULL,
	`defining_moment` text NOT NULL,
	`quote_text` text NOT NULL,
	`quote_author` text NOT NULL,
	`tone` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `story_chapters_slug_idx` ON `story_chapters` (`slug`);--> statement-breakpoint
CREATE INDEX `story_chapters_status_order_idx` ON `story_chapters` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `story_memories` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`snippet` text NOT NULL,
	`author` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `story_memories_status_order_idx` ON `story_memories` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `story_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `story_stats_status_order_idx` ON `story_stats` (`status`,`sort_order`);