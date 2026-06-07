ALTER TABLE `listing_submissions` ADD `hours` json DEFAULT ('{}');--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `socialLinks` json DEFAULT ('{}');--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `coverPhoto` varchar(500);--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `photos` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `googleReviewEmbedCode` text;--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `videoEmbed` varchar(500);