CREATE TABLE `import_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`importType` enum('products','suppliers') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`totalRows` int NOT NULL,
	`successRows` int NOT NULL,
	`failedRows` int NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL,
	`errorDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `import_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('stock_low','stock_critical','stock_out','supplier_alert','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`productId` int,
	`supplierId` int,
	`read` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`permission` varchar(100) NOT NULL,
	`resourceType` varchar(50),
	`resourceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_permissions_unique` UNIQUE(`userId`,`permission`,`resourceType`,`resourceId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('viewer','manager','admin') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
ALTER TABLE `import_history` ADD CONSTRAINT `import_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_supplierId_suppliers_id_fk` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `import_history_userId_idx` ON `import_history` (`userId`);--> statement-breakpoint
CREATE INDEX `import_history_createdAt_idx` ON `import_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_userId_read_idx` ON `notifications` (`userId`,`read`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_permissions_userId_idx` ON `user_permissions` (`userId`);