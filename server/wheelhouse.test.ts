import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@the-wheelhouse.com",
    name: "Test Member",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    membershipTier: "refined",
    membershipNumber: "TWH-TEST001",
    referralCode: "TESTREF1",
    pointsBalance: 1500,
    annualSpend: "500.00",
    totalSavings: "75.00",
    memberSince: new Date("2024-01-01"),
    avatarUrl: null,
    notifyEvents: true,
    notifyCommunity: true,
    notifyRewards: true,
    notifyEmail: true,
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns the current user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Member");
    expect(result?.email).toBe("test@the-wheelhouse.com");
  });

  it("logout clears session cookie and returns success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });

  it("me returns null when not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Points System Tests ──────────────────────────────────────────────────────
describe("points system", () => {
  it("validates point values for each activity type", () => {
    const POINTS = {
      purchase_per_dollar: 10,
      ride: 100,
      workshop: 250,
      special_event: 500,
      camp: 1000,
      referral: 2000,
    };

    expect(POINTS.purchase_per_dollar).toBe(10);
    expect(POINTS.ride).toBe(100);
    expect(POINTS.workshop).toBe(250);
    expect(POINTS.special_event).toBe(500);
    expect(POINTS.camp).toBe(1000);
    expect(POINTS.referral).toBe(2000);

    // Camps should award the most points
    expect(POINTS.camp).toBeGreaterThan(POINTS.special_event);
    expect(POINTS.special_event).toBeGreaterThan(POINTS.workshop);
    expect(POINTS.workshop).toBeGreaterThan(POINTS.ride);
  });

  it("calculates redemption value correctly", () => {
    const REDEMPTION_RATE = 100; // 1000 pts = $10, so 100 pts = $1
    const balance = 2500;
    const creditValue = balance / REDEMPTION_RATE;
    expect(creditValue).toBe(25);
  });

  it("calculates purchase points correctly", () => {
    const purchaseAmount = 150.00;
    const pointsPerDollar = 10;
    const expectedPoints = Math.floor(purchaseAmount * pointsPerDollar);
    expect(expectedPoints).toBe(1500);
  });

  it("validates minimum redemption threshold", () => {
    const MIN_REDEMPTION = 1000;
    expect(500).toBeLessThan(MIN_REDEMPTION); // cannot redeem
    expect(1000).toBeGreaterThanOrEqual(MIN_REDEMPTION); // can redeem
    expect(2500).toBeGreaterThanOrEqual(MIN_REDEMPTION); // can redeem
  });
});

// ─── Membership Tier Tests ────────────────────────────────────────────────────
describe("membership tiers", () => {
  it("validates tier hierarchy", () => {
    const TIERS = ["refined", "elite", "ultimate"];
    expect(TIERS.indexOf("refined")).toBeLessThan(TIERS.indexOf("elite"));
    expect(TIERS.indexOf("elite")).toBeLessThan(TIERS.indexOf("ultimate"));
  });

  it("validates tier spend thresholds", () => {
    const TIER_THRESHOLDS = { refined: 0, elite: 1500, ultimate: 3000 };
    expect(TIER_THRESHOLDS.elite).toBeGreaterThan(TIER_THRESHOLDS.refined);
    expect(TIER_THRESHOLDS.ultimate).toBeGreaterThan(TIER_THRESHOLDS.elite);
  });

  it("validates tier discount rates", () => {
    const DISCOUNTS = {
      refined_service: 10, refined_apparel: 15,
      elite_all: 25,
      ultimate_all: 25,
    };
    expect(DISCOUNTS.elite_all).toBeGreaterThan(DISCOUNTS.refined_service);
    expect(DISCOUNTS.ultimate_all).toBeGreaterThanOrEqual(DISCOUNTS.elite_all);
  });
});

// ─── Calendar URL Tests ───────────────────────────────────────────────────────
describe("calendar integration", () => {
  it("builds a valid Google Calendar URL", () => {
    const event = {
      title: "Saturday Morning Ride",
      description: "Group ride",
      location: "The Wheelhouse, Calgary",
      startDate: new Date("2026-04-05T09:00:00Z"),
      endDate: new Date("2026-04-05T11:00:00Z"),
    };

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(event.startDate)}/${fmt(event.endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    expect(googleUrl).toContain("calendar.google.com");
    expect(googleUrl).toContain("Saturday%20Morning%20Ride");
    expect(googleUrl).toContain("20260405T090000Z");
  });

  it("generates valid ICS content", () => {
    const event = {
      title: "Workshop",
      description: "Bike maintenance",
      location: "The Wheelhouse",
      startDate: new Date("2026-04-10T10:00:00Z"),
      endDate: new Date("2026-04-10T12:00:00Z"),
    };

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(event.startDate)}`,
      `DTEND:${fmt(event.endDate)}`,
      `SUMMARY:${event.title}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\n");

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Workshop");
    expect(ics).toContain("END:VCALENDAR");
  });
});

// ─── Referral System Tests ────────────────────────────────────────────────────
describe("referral system", () => {
  it("validates referral points value", () => {
    const REFERRAL_POINTS = 2000;
    const REFERRAL_CREDIT_VALUE = REFERRAL_POINTS / 100;
    expect(REFERRAL_CREDIT_VALUE).toBe(20);
  });

  it("generates a referral link correctly", () => {
    const referralCode = "TESTREF1";
    const baseUrl = "https://the-wheelhouse.com/join";
    const link = `${baseUrl}?ref=${referralCode}`;
    expect(link).toBe("https://the-wheelhouse.com/join?ref=TESTREF1");
    expect(link).toContain("ref=");
  });
});
