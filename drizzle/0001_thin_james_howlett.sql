CREATE TABLE `community_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_channels_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_channels_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`postType` enum('message','gear_listing','poll') NOT NULL DEFAULT 'message',
	`imageUrl` text,
	`gearTitle` varchar(255),
	`gearPrice` decimal(10,2),
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('ride','workshop','special','camp') NOT NULL,
	`location` varchar(255),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`maxAttendees` int,
	`isFree` boolean NOT NULL DEFAULT true,
	`price` decimal(10,2),
	`pointsReward` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL,
	`type` enum('earn','redeem') NOT NULL,
	`source` enum('purchase','ride','workshop','special_event','camp','referral','redemption','bonus') NOT NULL,
	`description` varchar(255),
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pollId` int NOT NULL,
	`userId` int NOT NULL,
	`optionIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poll_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`question` varchar(500) NOT NULL,
	`options` json NOT NULL,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredEmail` varchar(320),
	`referredUserId` int,
	`status` enum('pending','joined','rewarded') NOT NULL DEFAULT 'pending',
	`pointsAwarded` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`status` enum('registered','cancelled','attended') NOT NULL DEFAULT 'registered',
	`pointsAwarded` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rsvps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `membershipTier` enum('refined','elite','ultimate') DEFAULT 'refined' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `memberSince` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `membershipNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `annualSpend` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalSavings` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `pointsBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `notifyEvents` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyCommunity` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyRewards` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyEmail` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;