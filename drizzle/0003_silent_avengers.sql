ALTER TABLE `businesses` ADD `claimedByUserId` int;--> statement-breakpoint
ALTER TABLE `businesses` ADD `socialLinks` json DEFAULT ('{}');