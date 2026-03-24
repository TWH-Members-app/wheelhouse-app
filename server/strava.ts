/**
 * Strava API helper for The Wheelhouse app.
 * Handles token refresh, club activities, routes, and segments.
 * All API calls are server-side only — credentials never reach the client.
 */

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const WHEELHOUSE_CLUB_ID = 955495;
const OWNER_ATHLETE_ID = 12444268;

// In-memory token cache to avoid hammering the token endpoint
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getStravaAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > now + 300) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Strava credentials not configured");
  }

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }

  const data = await res.json() as { access_token: string; expires_at: number };
  cachedToken = { accessToken: data.access_token, expiresAt: data.expires_at };
  return data.access_token;
}

async function stravaGet(path: string, params?: Record<string, string | number>) {
  const token = await getStravaAccessToken();
  const url = new URL(`${STRAVA_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Strava API error ${res.status} for ${path}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StravaActivity {
  name: string;
  sport_type: string;
  distance: number;        // metres
  moving_time: number;     // seconds
  total_elevation_gain: number; // metres
  athlete: { firstname: string; lastname: string };
}

export interface StravaRoute {
  id: number;
  name: string;
  description: string;
  distance: number;
  elevation_gain: number;
  estimated_moving_time: number;
  type: number;            // 1 = ride, 2 = run
  map: { summary_polyline: string };
  timestamp: number;
}

export interface StravaSegment {
  id: number;
  name: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  climb_category: number;
  city: string;
  state: string;
  country: string;
  start_latlng: [number, number];
  end_latlng: [number, number];
}

export interface StravaClubInfo {
  id: number;
  name: string;
  sport_type: string;
  city: string;
  state: string;
  country: string;
  member_count: number;
  profile: string;
  cover_photo: string;
  description: string;
}

// ── API Methods ───────────────────────────────────────────────────────────────

export async function getClubInfo(): Promise<StravaClubInfo> {
  return stravaGet(`/clubs/${WHEELHOUSE_CLUB_ID}`);
}

export async function getClubActivities(perPage = 20, page = 1): Promise<StravaActivity[]> {
  return stravaGet(`/clubs/${WHEELHOUSE_CLUB_ID}/activities`, { per_page: perPage, page });
}

export async function getAthleteRoutes(perPage = 10, page = 1): Promise<StravaRoute[]> {
  return stravaGet(`/athletes/${OWNER_ATHLETE_ID}/routes`, { per_page: perPage, page });
}

export async function getRoute(routeId: number): Promise<StravaRoute> {
  return stravaGet(`/routes/${routeId}`);
}

export async function exploreSegments(
  bounds: [number, number, number, number], // sw_lat, sw_lng, ne_lat, ne_lng
  activityType: "riding" | "running" = "riding"
): Promise<{ segments: StravaSegment[] }> {
  return stravaGet("/segments/explore", {
    bounds: bounds.join(","),
    activity_type: activityType,
  });
}

export async function getSegment(segmentId: number): Promise<StravaSegment> {
  return stravaGet(`/segments/${segmentId}`);
}

/**
 * Download a route as a GPX file from Strava.
 * Returns the raw GPX string (XML) to be served to the client.
 */
export async function getRouteGpx(routeId: number): Promise<string> {
  const token = await getStravaAccessToken();
  const url = `${STRAVA_API_BASE}/routes/${routeId}/export_gpx`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Strava GPX export failed: ${res.status} for route ${routeId}`);
  }
  return res.text();
}

// ── Formatting Helpers ────────────────────────────────────────────────────────

export function formatDistance(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatElevation(metres: number): string {
  return `${Math.round(metres)} m`;
}

export function sportTypeLabel(sportType: string): string {
  const map: Record<string, string> = {
    Ride: "Road Ride",
    MountainBikeRide: "MTB Ride",
    GravelRide: "Gravel Ride",
    VirtualRide: "Virtual Ride",
    Run: "Run",
    Walk: "Walk",
  };
  return map[sportType] ?? sportType;
}
