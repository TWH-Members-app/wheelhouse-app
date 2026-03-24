import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  events, rsvps, pointsTransactions,
  communityChannels, communityPosts, postLikes, postComments,
  polls, pollVotes, referrals,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    // Generate membership number and referral code on first insert
    const membershipNumber = `TWH-${Date.now().toString(36).toUpperCase()}`;
    const referralCode = nanoid(8).toUpperCase();
    values.membershipNumber = membershipNumber;
    values.referralCode = referralCode;

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: {
  name?: string;
  avatarUrl?: string;
  notifyEvents?: boolean;
  notifyCommunity?: boolean;
  notifyRewards?: boolean;
  notifyEmail?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function getEvents(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category && category !== 'all') {
    return db.select().from(events)
      .where(eq(events.category, category as any))
      .orderBy(events.startDate);
  }
  return db.select().from(events).orderBy(events.startDate);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRsvpForUser(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rsvps)
    .where(and(eq(rsvps.userId, userId), eq(rsvps.eventId, eventId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createRsvp(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(rsvps).values({ userId, eventId, status: 'registered' });
}

export async function cancelRsvp(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(rsvps).set({ status: 'cancelled' })
    .where(and(eq(rsvps.userId, userId), eq(rsvps.eventId, eventId)));
}

export async function getUserRsvps(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rsvps).where(eq(rsvps.userId, userId));
}

export async function getEventAttendeeCount(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(rsvps)
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, 'registered')));
  return Number(result[0]?.count ?? 0);
}

// ─── Points ───────────────────────────────────────────────────────────────────
export async function addPoints(userId: number, points: number, source: string, description: string, referenceId?: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pointsTransactions).values({
    userId, points, type: 'earn', source: source as any, description, referenceId
  });
  await db.update(users).set({
    pointsBalance: sql`${users.pointsBalance} + ${points}`
  }).where(eq(users.id, userId));
}

export async function redeemPoints(userId: number, points: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pointsTransactions).values({
    userId, points: -points, type: 'redeem', source: 'redemption', description: `Redeemed ${points} points for $${points / 100} store credit`
  });
  await db.update(users).set({
    pointsBalance: sql`${users.pointsBalance} - ${points}`
  }).where(eq(users.id, userId));
}

export async function getPointsHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pointsTransactions)
    .where(eq(pointsTransactions.userId, userId))
    .orderBy(desc(pointsTransactions.createdAt))
    .limit(50);
}

// ─── Community ────────────────────────────────────────────────────────────────
export async function getChannels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communityChannels).orderBy(communityChannels.id);
}

export async function getPostsByChannel(channelId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    post: communityPosts,
    user: { id: users.id, name: users.name, membershipTier: users.membershipTier, avatarUrl: users.avatarUrl },
  }).from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.channelId, channelId))
    .orderBy(desc(communityPosts.createdAt))
    .limit(50);
}

export async function createPost(data: {
  channelId: number; userId: number; content: string;
  postType?: 'message' | 'gear_listing' | 'poll';
  gearTitle?: string; gearPrice?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(communityPosts).values({
    channelId: data.channelId,
    userId: data.userId,
    content: data.content,
    postType: data.postType ?? 'message',
    gearTitle: data.gearTitle,
    gearPrice: data.gearPrice as any,
  });
  return result;
}

export async function createPoll(postId: number, question: string, options: string[], endsAt?: Date) {
  const db = await getDb();
  if (!db) return;
  await db.insert(polls).values({ postId, question, options: JSON.stringify(options), endsAt });
}

export async function getPollByPostId(postId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(polls).where(eq(polls.postId, postId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPollVotes(pollId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pollVotes).where(eq(pollVotes.pollId, pollId));
}

export async function votePoll(pollId: number, userId: number, optionIndex: number) {
  const db = await getDb();
  if (!db) return;
  // Check if already voted
  const existing = await db.select().from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId))).limit(1);
  if (existing.length > 0) throw new Error("Already voted");
  await db.insert(pollVotes).values({ pollId, userId, optionIndex });
}

export async function toggleLike(postId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    await db.update(communityPosts).set({ likesCount: sql`${communityPosts.likesCount} - 1` }).where(eq(communityPosts.id, postId));
    return false;
  } else {
    await db.insert(postLikes).values({ postId, userId });
    await db.update(communityPosts).set({ likesCount: sql`${communityPosts.likesCount} + 1` }).where(eq(communityPosts.id, postId));
    return true;
  }
}

export async function getComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    comment: postComments,
    user: { id: users.id, name: users.name, membershipTier: users.membershipTier },
  }).from(postComments)
    .leftJoin(users, eq(postComments.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(postComments.createdAt);
}

export async function addComment(postId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postComments).values({ postId, userId, content });
  await db.update(communityPosts).set({ commentsCount: sql`${communityPosts.commentsCount} + 1` }).where(eq(communityPosts.id, postId));
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export async function getReferralsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referrals).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
}

export async function createReferral(referrerId: number, referredEmail?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(referrals).values({ referrerId, referredEmail, status: 'pending' });
}
