import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  membershipTier: mysqlEnum("membershipTier", ["refined", "elite", "ultimate"]).default("refined").notNull(),
  memberSince: timestamp("memberSince").defaultNow().notNull(),
  membershipNumber: varchar("membershipNumber", { length: 32 }),
  annualSpend: decimal("annualSpend", { precision: 10, scale: 2 }).default("0").notNull(),
  totalSavings: decimal("totalSavings", { precision: 10, scale: 2 }).default("0").notNull(),
  pointsBalance: int("pointsBalance").default(0).notNull(),
  referralCode: varchar("referralCode", { length: 16 }),
  notifyEvents: boolean("notifyEvents").default(true).notNull(),
  notifyCommunity: boolean("notifyCommunity").default(true).notNull(),
  notifyRewards: boolean("notifyRewards").default(true).notNull(),
  notifyEmail: boolean("notifyEmail").default(true).notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Events ──────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["ride", "workshop", "special", "camp"]).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  maxAttendees: int("maxAttendees"),
  isFree: boolean("isFree").default(true).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  pointsReward: int("pointsReward").default(0).notNull(),
  imageUrl: text("imageUrl"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── RSVPs ───────────────────────────────────────────────────────────────────
export const rsvps = mysqlTable("rsvps", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  status: mysqlEnum("status", ["registered", "cancelled", "attended"]).default("registered").notNull(),
  pointsAwarded: boolean("pointsAwarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rsvp = typeof rsvps.$inferSelect;

// ─── Points Transactions ──────────────────────────────────────────────────────
export const pointsTransactions = mysqlTable("points_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  points: int("points").notNull(),
  type: mysqlEnum("type", ["earn", "redeem"]).notNull(),
  source: mysqlEnum("source", ["purchase", "ride", "workshop", "special_event", "camp", "referral", "redemption", "bonus"]).notNull(),
  description: varchar("description", { length: 255 }),
  referenceId: int("referenceId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointsTransaction = typeof pointsTransactions.$inferSelect;

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  referredEmail: varchar("referredEmail", { length: 320 }),
  referredUserId: int("referredUserId"),
  status: mysqlEnum("status", ["pending", "joined", "rewarded"]).default("pending").notNull(),
  pointsAwarded: boolean("pointsAwarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;

// ─── Community Channels ───────────────────────────────────────────────────────
export const communityChannels = mysqlTable("community_channels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityChannel = typeof communityChannels.$inferSelect;

// ─── Community Posts ──────────────────────────────────────────────────────────
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  postType: mysqlEnum("postType", ["message", "gear_listing", "poll"]).default("message").notNull(),
  imageUrl: text("imageUrl"),
  gearTitle: varchar("gearTitle", { length: 255 }),
  gearPrice: decimal("gearPrice", { precision: 10, scale: 2 }),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;

// ─── Post Likes ───────────────────────────────────────────────────────────────
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Post Comments ────────────────────────────────────────────────────────────
export const postComments = mysqlTable("post_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;

// ─── Polls ────────────────────────────────────────────────────────────────────
export const polls = mysqlTable("polls", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  question: varchar("question", { length: 500 }).notNull(),
  options: json("options").notNull(), // string[]
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Poll = typeof polls.$inferSelect;

// ─── Poll Votes ───────────────────────────────────────────────────────────────
export const pollVotes = mysqlTable("poll_votes", {
  id: int("id").autoincrement().primaryKey(),
  pollId: int("pollId").notNull(),
  userId: int("userId").notNull(),
  optionIndex: int("optionIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PollVote = typeof pollVotes.$inferSelect;
