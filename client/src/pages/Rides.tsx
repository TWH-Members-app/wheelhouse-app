import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Bike, Clock, MapPin, ChevronRight,
  Activity, Mountain, RefreshCw, ExternalLink, ArrowLeft
} from "lucide-react";

type Tab = "feed" | "routes";

// Shape returned by trpc.strava.routes
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

function RouteDetail({ route, onBack }: { route: RouteItem; onBack: () => void }) {
  return (
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

      {/* Strava link */}
      <div className="px-4">
        <a
          href={`https://www.strava.com/routes/${route.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#FC4C02] text-white font-bold py-3 rounded-xl w-full"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          <ExternalLink className="w-4 h-4" />
          VIEW FULL ROUTE ON STRAVA
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
  );
}

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

  // Route detail view — uses data already in memory, no extra API call
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
                  {/* Athlete + sport type */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#f1b53b] flex items-center justify-center text-[#161d26] font-bold text-sm">
                        {activity.athleteName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">
                          {activity.athleteName}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {activity.sportTypeLabel}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg">
                      {SPORT_ICONS[activity.sportType] ?? "🚴"}
                    </span>
                  </div>

                  {/* Activity name */}
                  <p className="text-white font-bold mb-3">{activity.name}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <MapPin className="w-3 h-3 text-[#f1b53b] mx-auto mb-0.5" />
                      <p className="text-white text-sm font-bold">
                        {activity.distanceFormatted}
                      </p>
                      <p className="text-gray-500 text-xs">Distance</p>
                    </div>
                    <div className="text-center">
                      <Mountain className="w-3 h-3 text-[#f1b53b] mx-auto mb-0.5" />
                      <p className="text-white text-sm font-bold">
                        {activity.elevationFormatted}
                      </p>
                      <p className="text-gray-500 text-xs">Elevation</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-3 h-3 text-[#f1b53b] mx-auto mb-0.5" />
                      <p className="text-white text-sm font-bold">
                        {activity.movingTimeFormatted}
                      </p>
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
          <p className="text-gray-400 text-sm mb-3">Wheelhouse curated routes</p>

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
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#161d26] rounded-lg p-2 text-center">
                      <p className="text-[#f1b53b] text-sm font-bold">
                        {route.distanceFormatted}
                      </p>
                      <p className="text-gray-500 text-xs">Distance</p>
                    </div>
                    <div className="bg-[#161d26] rounded-lg p-2 text-center">
                      <p className="text-[#f1b53b] text-sm font-bold">
                        {route.elevationFormatted}
                      </p>
                      <p className="text-gray-500 text-xs">Elevation</p>
                    </div>
                    <div className="bg-[#161d26] rounded-lg p-2 text-center">
                      <p className="text-[#f1b53b] text-sm font-bold">
                        {route.estimatedTimeFormatted}
                      </p>
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
              <p className="text-gray-500 text-sm mt-1">
                Save routes on Strava to see them here
              </p>
            </div>
          )}

          {/* Strava attribution */}
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Activity className="w-3 h-3 text-[#FC4C02]" />
            <span>Data powered by Strava API</span>
          </div>
        </div>
      )}
    </div>
  );
}
