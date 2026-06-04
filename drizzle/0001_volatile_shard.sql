CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`name` varchar(200) NOT NULL,
	`categoryId` int NOT NULL,
	`description` text,
	`shortDescription` varchar(300),
	`address` varchar(300),
	`area` varchar(100) DEFAULT 'Siesta Key Village',
	`phone` varchar(30),
	`website` varchar(300),
	`email` varchar(200),
	`photos` json DEFAULT ('[]'),
	`hours` json DEFAULT ('{}'),
	`lat` varchar(30),
	`lng` varchar(30),
	`tier` enum('free','featured','sponsored') NOT NULL DEFAULT 'free',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isSponsored` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`isClaimed` boolean NOT NULL DEFAULT false,
	`rating` varchar(5) DEFAULT '4.5',
	`reviewCount` int DEFAULT 0,
	`tags` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`icon` varchar(50) NOT NULL DEFAULT 'store',
	`description` text,
	`sortOrder` int DEFAULT 0,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `claim_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int,
	`businessName` varchar(200) NOT NULL,
	`contactName` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`message` text,
	`ghlWebhookSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `claim_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(200) NOT NULL,
	`categoryId` int,
	`contactName` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`website` varchar(300),
	`address` varchar(300),
	`description` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`ghlWebhookSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_submissions_id` PRIMARY KEY(`id`)
);
