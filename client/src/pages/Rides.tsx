import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Bike, Clock, MapPin, ChevronRight,
  Activity, Mountain, RefreshCw, ExternalLink, ArrowLeft,
  Download, Share2, X, Smartphone,
} from "lucide-react";

type Tab = "feed" | "routes";

type RouteItem = {
  id: number;
  name: string;
  description: string;
  distanceFormatted: string;
  distanceMetres: number;
  elevationFormatted: string;
  elevationMetres: number;
  estimatedTimeFormatted: string;
  type: number;
  polyline: string | null;
  timestamp: number;
};

const SPORT_ICONS: Record<string, string> = {
  Ride: "🚴",
  MountainBikeRide: "🚵",
  GravelRide: "🪨",
  VirtualRide: "💻",
  Run: "🏃",
  Walk: "🚶",
};

// ── Send to Device Sheet ───────────────────────────────────────────────────────

function SendToDeviceSheet({
  route,
  onClose,
}: {
  route: RouteItem;
  onClose: () => void;
}) {
  const exportGpx = trpc.strava.exportGpx.useMutation();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadGpx = async (device: "garmin" | "karoo" | "wahoo" | "download") => {
    setDownloading(true);
    try {
      const result = await exportGpx.mutateAsync({ routeId: route.id });
      const gpxContent = atob(result.gpxBase64);
      const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
      const url = URL.createObjectURL(blob);

      if (device === "garmin") {
        // Download GPX then open Garmin Connect import page
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => {
          window.open("https://connect.garmin.com/modern/course/import", "_blank");
        }, 800);
        toast.success("GPX downloaded — Garmin Connect import page opened");
      } else if (device === "karoo") {
        // Use Web Share API to open in Hammerhead companion app
        if (navigator.share && navigator.canShare) {
          const file = new File([gpxContent], result.filename, { type: "application/gpx+xml" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Wheelhouse Route: ${route.name}`,
              text: `${route.distanceFormatted} · ${route.elevationFormatted} elevation`,
              files: [file],
            });
            toast.success("Route shared — open in Hammerhead app");
          } else {
            // Fallback: download
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.info("GPX downloaded — import via Hammerhead dashboard");
          }
        } else {
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename;
          a.click();
          URL.revokeObjectURL(url);
          toast.info("GPX downloaded — import via hammerhead.io/dashboard");
        }
      } else if (device === "wahoo") {
        // Use Web Share API to open in Wahoo ELEMNT app
        if (navigator.share && navigator.canShare) {
          const file = new File([gpxContent], result.filename, { type: "application/gpx+xml" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Wheelhouse Route: ${route.name}`,
              text: `${route.distanceFormatted} · ${route.elevationFormatted} elevation`,
              files: [file],
            });
            toast.success("Route shared — open in Wahoo ELEMNT app");
          } else {
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.info("GPX downloaded — import via Wahoo ELEMNT app");
          }
        } else {
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename;
          a.click();
          URL.revokeObjectURL(url);
          toast.info("GPX downloaded — import via Wahoo ELEMNT app");
        }
      } else {
        // Plain download
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("GPX file downloaded");
      }
    } catch (err) {
      toast.error("Failed to export GPX — please try again");
    } finally {
      setDownloading(false);
    }
  };

  const devices = [
    {
      id: "garmin" as const,
      name: "Garmin",
      subtitle: "Downloads GPX + opens Garmin Connect",
      emoji: "⌚",
      color: "#1a6bba",
      steps: "Download GPX → Import in Garmin Connect → Sync to device",
    },
    {
      id: "karoo" as const,
      name: "Karoo (Hammerhead)",
      subtitle: "Share directly to Hammerhead app",
      emoji: "🗺️",
      color: "#e85d26",
      steps: "Tap Share → Select Hammerhead → Route syncs to Karoo",
    },
    {
      id: "wahoo" as const,
      name: "Wahoo ELEMNT",
      subtitle: "Share directly to Wahoo app",
      emoji: "🚴",
      color: "#e31837",
      steps: "Tap Share → Select Wahoo ELEMNT → Route syncs to device",
    },
    {
      id: "download" as const,
      name: "Download GPX",
      subtitle: "Save file to import anywhere",
      emoji: "📁",
      color: "#4a5568",
      steps: "Save .gpx file to your device",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e2a38] rounded-t-2xl pb-8 max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a3a4e]">
          <div>
            <h3
              className="text-white font-bold text-base"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              SEND TO DEVICE
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[220px]">
              {route.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route summary */}
        <div className="flex gap-4 px-5 py-3 bg-[#161d26] mx-4 mt-3 rounded-xl">
          <div className="text-center flex-1">
            <p className="text-[#f1b53b] font-bold text-sm">{route.distanceFormatted}</p>
            <p className="text-gray-500 text-xs">Distance</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[#f1b53b] font-bold text-sm">{route.elevationFormatted}</p>
            <p className="text-gray-500 text-xs">Elevation</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[#f1b53b] font-bold text-sm">{route.estimatedTimeFormatted}</p>
            <p className="text-gray-500 text-xs">Est. Time</p>
          </div>
        </div>

        {/* Device options */}
        <div className="px-4 mt-4 space-y-3">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => handleDownloadGpx(device.id)}
              disabled={downloading}
              className="w-full bg-[#161d26] rounded-xl p-4 text-left flex items-center gap-4 active:opacity-70 disabled:opacity-50 transition-opacity"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${device.color}22` }}
              >
                {device.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{device.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{device.subtitle}</p>
                <p className="text-gray-600 text-xs mt-1 italic">{device.steps}</p>
              </div>
              {downloading ? (
                <div className="w-4 h-4 border-2 border-[#f1b53b] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Info note */}
        <div className="mx-4 mt-4 bg-[#161d26] rounded-xl p-3">
          <div className="flex gap-2">
            <Smartphone className="w-4 h-4 text-[#f1b53b] flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs">
              For Karoo and Wahoo, the native share sheet will appear — select your device's companion app to sync the route wirelessly. Garmin full auto-sync coming soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Route Detail ───────────────────────────────────────────────────────────────

function RouteDetail({ route, onBack }: { route: RouteItem; onBack: () => void }) {
  const [showSendSheet, setShowSendSheet] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#161d26] pb-24">
        {/* Header */}
        <div className="bg-[#1e2a38] px-4 pt-12 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[#f1b53b] text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Routes
          </button>
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {route.name}
          </h1>
          {route.description && (
            <p className="text-gray-400 text-sm mt-1">{route.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 py-4">
          {[
            { icon: MapPin, label: "Distance", value: route.distanceFormatted },
            { icon: Mountain, label: "Elevation", value: route.elevationFormatted },
            { icon: Clock, label: "Est. Time", value: route.estimatedTimeFormatted },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#1e2a38] rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 text-[#f1b53b] mx-auto mb-1" />
              <p className="text-white font-bold text-base">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Route type badge */}
        <div className="px-4 mb-4">
          <span className="bg-[#f1b53b] text-[#161d26] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {route.type === 1 ? "🚴 Cycling" : "🏃 Running"} Route
          </span>
        </div>

        {/* Action buttons */}
        <div className="px-4 space-y-3">
          {/* Send to Device — primary CTA */}
          <button
            onClick={() => setShowSendSheet(true)}
            className="flex items-center justify-center gap-2 bg-[#f1b53b] text-[#161d26] font-bold py-3 rounded-xl w-full"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            <Share2 className="w-4 h-4" />
            SEND TO DEVICE
          </button>

          {/* View on Strava */}
          <a
            href={`https://www.strava.com/routes/${route.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#FC4C02] text-white font-bold py-3 rounded-xl w-full"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            <ExternalLink className="w-4 h-4" />
            VIEW ON STRAVA
          </a>
        </div>

        {/* Polyline map hint */}
        {route.polyline && (
          <div className="px-4 mt-4">
            <div className="bg-[#1e2a38] rounded-xl p-4 text-center">
              <MapPin className="w-8 h-8 text-[#f1b53b] mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                Full interactive map available on Strava
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Send to Device Sheet */}
      {showSendSheet && (
        <SendToDeviceSheet
          route={route}
          onClose={() => setShowSendSheet(false)}
        />
      )}
    </>
  );
}

// ── Main Rides Page ────────────────────────────────────────────────────────────

export default function Rides() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  const { data: clubInfo } = trpc.strava.clubInfo.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: activities,
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = trpc.strava.clubActivities.useQuery(
    { perPage: 20, page: 1 },
    { enabled: isAuthenticated && tab === "feed", staleTime: 2 * 60 * 1000 }
  );

  const { data: routes, isLoading: routesLoading } = trpc.strava.routes.useQuery(
    { page: 1 },
    { enabled: isAuthenticated && tab === "routes", staleTime: 5 * 60 * 1000 }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#161d26] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f1b53b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#161d26] flex flex-col items-center justify-center px-6 text-center">
        <Bike className="w-16 h-16 text-[#f1b53b] mb-4" />
        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          MEMBER RIDES
        </h2>
        <p className="text-gray-400 mb-6">
          Sign in to view the Wheelhouse club ride feed, routes, and segments.
        </p>
        <a
          href={getLoginUrl()}
          className="bg-[#f1b53b] text-[#161d26] font-bold py-3 px-8 rounded-full"
        >
          SIGN IN
        </a>
      </div>
    );
  }

  if (selectedRoute) {
    return <RouteDetail route={selectedRoute} onBack={() => setSelectedRoute(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#161d26] pb-24">
      {/* Header */}
      <div className="bg-[#1e2a38] px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[#f1b53b] text-xs font-bold tracking-widest uppercase">
              Powered by Strava
            </p>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              RIDES
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {clubInfo && (
              <div className="text-right">
                <p className="text-white text-sm font-bold">{clubInfo.name}</p>
                <p className="text-gray-400 text-xs">
                  {clubInfo.member_count?.toLocaleString()} members
                </p>
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-[#FC4C02] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {(["feed", "routes"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                tab === t
                  ? "bg-[#f1b53b] text-[#161d26]"
                  : "bg-[#161d26] text-gray-400"
              }`}
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {t === "feed" ? "Club Feed" : "Routes"}
            </button>
          ))}
        </div>
      </div>

      {/* Club Activity Feed */}
      {tab === "feed" && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">
              Recent rides from Wheelhouse members
            </p>
            <button onClick={() => refetchActivities()} className="text-[#f1b53b] p-1">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {activitiesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#1e2a38] rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-[#2a3a4e] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#2a3a4e] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity, idx) => (
                <div key={idx} className="bg-[#1e2a38] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#f1b53b] flex items-center justify-center text-[#161d26] font-bold text-sm">
                        {activity.athleteName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{activity.athleteName}</p>
                        <p className="text-gray-500 text-xs">{activity.sportTypeLabel}</p>
                      </div>
                    </div>
                    <span className="text-lg">{SPORT_ICONS[activity.sportType] ?? "🚴"}</span>
                  </div>
                  <p className="text-white font-bold mb-3">{activity.name}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <MapPin className="w-3 h-3 text-[#f1b53b] mx-auto mb-0.5" />
                      <p className="text-white text-sm font-bold">{activity.distanceFormatted}</p>
                      <p className="text-gray-500 text-xs">Distance</p>
                    </div>
                    <div className="text-center">
                      <Mountain className="w-3 h-3 text-[#f1b53b] mx-auto mb-0.5" />
                      <p className="text-white text-sm font-bold">{activity.elevationFormatted}</p>
                      <p className="text-gray-500 text-xs">Elevation</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-3 h-3 text-[#f1b53b] mx-auto mb-0.5" />
                      <p className="text-white text-sm font-bold">{activity.movingTimeFormatted}</p>
                      <p className="text-gray-500 text-xs">Moving Time</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bike className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent club activities</p>
            </div>
          )}
        </div>
      )}

      {/* Routes */}
      {tab === "routes" && (
        <div className="px-4 py-4">
          <p className="text-gray-400 text-sm mb-3">
            Tap a route to view details and send to your device
          </p>

          {routesLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#1e2a38] rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-[#2a3a4e] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#2a3a4e] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-3">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className="w-full bg-[#1e2a38] rounded-xl p-4 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-white font-bold truncate">{route.name}</p>
                      {route.description && (
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                          {route.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="bg-[#f1b53b]/10 rounded-lg px-2 py-1 flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-[#f1b53b]" />
                        <span className="text-[#f1b53b] text-xs font-bold">Send</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#161d26] rounded-lg p-2 text-center">
                      <p className="text-[#f1b53b] text-sm font-bold">{route.distanceFormatted}</p>
                      <p className="text-gray-500 text-xs">Distance</p>
                    </div>
                    <div className="bg-[#161d26] rounded-lg p-2 text-center">
                      <p className="text-[#f1b53b] text-sm font-bold">{route.elevationFormatted}</p>
                      <p className="text-gray-500 text-xs">Elevation</p>
                    </div>
                    <div className="bg-[#161d26] rounded-lg p-2 text-center">
                      <p className="text-[#f1b53b] text-sm font-bold">{route.estimatedTimeFormatted}</p>
                      <p className="text-gray-500 text-xs">Est. Time</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No routes available</p>
              <p className="text-gray-500 text-sm mt-1">Save routes on Strava to see them here</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Activity className="w-3 h-3 text-[#FC4C02]" />
            <span>Data powered by Strava API</span>
          </div>
        </div>
      )}
    </div>
  );
}
