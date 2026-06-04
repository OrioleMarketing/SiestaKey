ALTER TABLE `users` ADD `stripeCustomerId` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('free','gulf_breeze','island_premier') DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(50) DEFAULT 'inactive';