CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(120) NOT NULL,
	`eyebrow` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`features` text NOT NULL,
	`priceCents` int NOT NULL,
	`billingPeriod` varchar(32) NOT NULL DEFAULT 'month',
	`accent` varchar(32) NOT NULL DEFAULT 'violet',
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketCode` varchar(32) NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(64) NOT NULL,
	`company` varchar(160),
	`message` text,
	`status` enum('new','contacted','in_progress','completed','closed') NOT NULL DEFAULT 'new',
	`followUpNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticketCode_unique` UNIQUE(`ticketCode`)
);
--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;