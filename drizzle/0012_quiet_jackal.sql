CREATE TABLE `business_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`type` enum('event','announcement') NOT NULL DEFAULT 'event',
	`title` varchar(300) NOT NULL,
	`description` text,
	`startDate` varchar(30),
	`endDate` varchar(30),
	`location` varchar(300),
	`imageUrl` varchar(500),
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_events_id` PRIMARY KEY(`id`)
);
