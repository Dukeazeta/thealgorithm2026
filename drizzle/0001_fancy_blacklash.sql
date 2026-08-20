CREATE TABLE `submission_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`contributor_name` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`expected_count` integer NOT NULL,
	`edit_token_hash` text NOT NULL,
	`status` text DEFAULT 'uploading' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `submission_batches_status_idx` ON `submission_batches` (`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `batch_id` text REFERENCES submission_batches(id);--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `client_file_id` text;--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `source_file_name` text;--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `source_mime_type` text;--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `source_byte_size` integer;--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `source_last_modified` integer;--> statement-breakpoint
ALTER TABLE `memory_submissions` ADD `ordinal` integer;--> statement-breakpoint
CREATE INDEX `memory_submissions_batch_idx` ON `memory_submissions` (`batch_id`,`status`);