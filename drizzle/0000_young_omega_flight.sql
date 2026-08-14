CREATE TABLE `stations` (
	`id` text PRIMARY KEY NOT NULL,
	`idx` integer NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stations_idx_unique` ON `stations` (`idx`);--> statement-breakpoint
CREATE UNIQUE INDEX `stations_name_unique` ON `stations` (`name`);