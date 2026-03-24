import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getEvents, getEventById, getRsvpForUser, createRsvp, cancelRsvp,
  getUserRsvps, getEventAttendeeCount,
  addPoints, redeemPoints, getPointsHistory,
  getChannels, getPostsByChannel, createPost, createPoll,
  getPollByPostId, getPollVotes, votePoll, toggleLike, getComments, addComment,
  getReferralsByUser, createReferral,
  updateUserProfile, getUserById,
} from "./db";
import {
  getClubInfo, getClubActivities, getAthleteRoutes, getRoute,
  exploreSegments, getSegment, getRouteGpx,
  formatDistance, formatDuration, formatElevation, sportTypeLabel,
} from "./strava";

export const appRouter = router({
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Profile ───────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserById(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        avatarUrl: z.string().optional(),
        notifyEvents: z.boolean().optional(),
        notifyCommunity: z.boolean().optional(),
        notifyRewards: z.boolean().optional(),
        notifyEmail: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ── Events ────────────────────────────────────────────────────────────────
  events: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ input }) => {
        return getEvents(input.category);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const event = await getEventById(input.id);
        const attendeeCount = await getEventAttendeeCount(input.id);
        return { event, attendeeCount };
      }),
    rsvp: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getRsvpForUser(ctx.user.id, input.eventId);
        if (existing && existing.status === 'registered') {
          await cancelRsvp(ctx.user.id, input.eventId);
          return { registered: false };
        }
        await createRsvp(ctx.user.id, input.eventId);
        // Award points for RSVP
        const event = await getEventById(input.eventId);
        if (event && event.pointsReward > 0) {
          await addPoints(ctx.user.id, event.pointsReward, event.category === 'ride' ? 'ride' : event.category === 'workshop' ? 'workshop' : event.category === 'camp' ? 'camp' : 'special_event', `Registered for: ${event.title}`, event.id);
        }
        return { registered: true };
      }),
    myRsvps: protectedProcedure.query(async ({ ctx }) => {
      return getUserRsvps(ctx.user.id);
    }),
    getRsvpStatus: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rsvp = await getRsvpForUser(ctx.user.id, input.eventId);
        return { registered: rsvp?.status === 'registered' };
      }),
  }),

  // ── Rewards & Points ──────────────────────────────────────────────────────
  rewards: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      return getPointsHistory(ctx.user.id);
    }),
    redeem: protectedProcedure
      .input(z.object({ points: z.number().min(1000) }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user || user.pointsBalance < input.points) {
          throw new Error("Insufficient points balance");
        }
        await redeemPoints(ctx.user.id, input.points);
        return { success: true, creditValue: input.points / 100 };
      }),
    addPurchasePoints: protectedProcedure
      .input(z.object({ amount: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        const points = Math.floor(input.amount * 10);
        await addPoints(ctx.user.id, points, 'purchase', `Purchase of $${input.amount.toFixed(2)}`);
        return { pointsAdded: points };
      }),
  }),

  // ── Community ─────────────────────────────────────────────────────────────
  community: router({
    channels: protectedProcedure.query(async () => {
      return getChannels();
    }),
    posts: protectedProcedure
      .input(z.object({ channelId: z.number() }))
      .query(async ({ input }) => {
        return getPostsByChannel(input.channelId);
      }),
    createPost: protectedProcedure
      .input(z.object({
        channelId: z.number(),
        content: z.string().min(1),
        postType: z.enum(['message', 'gear_listing', 'poll']).optional(),
        gearTitle: z.string().optional(),
        gearPrice: z.string().optional(),
        pollQuestion: z.string().optional(),
        pollOptions: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createPost({
          channelId: input.channelId,
          userId: ctx.user.id,
          content: input.content,
          postType: input.postType,
          gearTitle: input.gearTitle,
          gearPrice: input.gearPrice,
        });
        // If it's a poll, create poll record
        if (input.postType === 'poll' && input.pollQuestion && input.pollOptions && result) {
          const insertId = (result as any).insertId;
          if (insertId) {
            await createPoll(insertId, input.pollQuestion, input.pollOptions);
          }
        }
        return { success: true };
      }),
    getPoll: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        const poll = await getPollByPostId(input.postId);
        if (!poll) return null;
        const votes = await getPollVotes(poll.id);
        return { poll, votes };
      }),
    vote: protectedProcedure
      .input(z.object({ pollId: z.number(), optionIndex: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await votePoll(input.pollId, ctx.user.id, input.optionIndex);
        return { success: true };
      }),
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const liked = await toggleLike(input.postId, ctx.user.id);
        return { liked };
      }),
    comments: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return getComments(input.postId);
      }),
    addComment: protectedProcedure
      .input(z.object({ postId: z.number(), content: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await addComment(input.postId, ctx.user.id, input.content);
        return { success: true };
      }),
  }),

  // ── Strava ───────────────────────────────────────────────────────────────
  strava: router({
    clubInfo: protectedProcedure.query(async () => {
      return getClubInfo();
    }),
    clubActivities: protectedProcedure
      .input(z.object({ page: z.number().optional(), perPage: z.number().optional() }))
      .query(async ({ input }) => {
        const activities = await getClubActivities(input.perPage ?? 20, input.page ?? 1);
        return activities.map(a => ({
          name: a.name,
          sportType: a.sport_type,
          sportTypeLabel: sportTypeLabel(a.sport_type),
          distanceFormatted: formatDistance(a.distance),
          distanceMetres: a.distance,
          movingTimeFormatted: formatDuration(a.moving_time),
          movingTimeSeconds: a.moving_time,
          elevationFormatted: formatElevation(a.total_elevation_gain),
          elevationMetres: a.total_elevation_gain,
          athleteName: `${a.athlete.firstname} ${a.athlete.lastname}`,
        }));
      }),
    routes: protectedProcedure
      .input(z.object({ page: z.number().optional() }))
      .query(async ({ input }) => {
        const routes = await getAthleteRoutes(10, input.page ?? 1);
        return routes.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          distanceFormatted: formatDistance(r.distance),
          distanceMetres: r.distance,
          elevationFormatted: formatElevation(r.elevation_gain),
          elevationMetres: r.elevation_gain,
          estimatedTimeFormatted: formatDuration(r.estimated_moving_time),
          type: r.type,
          polyline: r.map?.summary_polyline ?? null,
          timestamp: r.timestamp,
        }));
      }),
    routeDetail: protectedProcedure
      .input(z.object({ routeId: z.number() }))
      .query(async ({ input }) => {
        const r = await getRoute(input.routeId);
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          distanceFormatted: formatDistance(r.distance),
          distanceMetres: r.distance,
          elevationFormatted: formatElevation(r.elevation_gain),
          elevationMetres: r.elevation_gain,
          estimatedTimeFormatted: formatDuration(r.estimated_moving_time),
          polyline: r.map?.summary_polyline ?? null,
        };
      }),
    exploreSegments: protectedProcedure
      .input(z.object({
        swLat: z.number(), swLng: z.number(),
        neLat: z.number(), neLng: z.number(),
      }))
      .query(async ({ input }) => {
        const result = await exploreSegments(
          [input.swLat, input.swLng, input.neLat, input.neLng]
        );
        return (result.segments ?? []).map((s: any) => ({
          id: s.id,
          name: s.name,
          distanceFormatted: formatDistance(s.distance),
          distanceMetres: s.distance,
          avgGrade: s.avg_grade,
          elevDifference: s.elev_difference,
          climbCategory: s.climb_category,
          startLatlng: s.start_latlng,
          endLatlng: s.end_latlng,
          points: s.points,
        }));
      }),
    exportGpx: protectedProcedure
      .input(z.object({ routeId: z.number() }))
      .mutation(async ({ input }) => {
        const gpxContent = await getRouteGpx(input.routeId);
        // Return as base64 so it can be safely transmitted via JSON
        const base64 = Buffer.from(gpxContent, 'utf-8').toString('base64');
        return { gpxBase64: base64, filename: `wheelhouse-route-${input.routeId}.gpx` };
      }),
  }),

  // ── Referrals ─────────────────────────────────────────────────────────────
  referrals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getReferralsByUser(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({ email: z.string().email().optional() }))
      .mutation(async ({ ctx, input }) => {
        await createReferral(ctx.user.id, input.email);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
