ALTER TABLE `listing_submissions` ADD `tier` enum('free','gulf_breeze','island_premier') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `stripeCheckoutSessionId` varchar(200);--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `stripePaymentIntentId` varchar(200);--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `stripeSubscriptionId` varchar(200);--> statement-breakpoint
ALTER TABLE `listing_submissions` ADD `createdBusinessId` int;