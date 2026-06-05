ALTER TABLE `businesses` ADD `coverPhoto` varchar(500);--> statement-breakpoint
ALTER TABLE `claim_leads` ADD `status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `claim_leads` ADD `ghlContactId` varchar(100);--> statement-breakpoint
ALTER TABLE `claim_leads` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `createdBusinessSlug` varchar(150);