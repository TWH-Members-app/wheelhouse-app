import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Bike, TrendingUp, Clock, Users, MapPin, ChevronRight,
  Activity, Mountain, Zap, RefreshCw, ExternalLink
} from "lucide-react";

type Tab = "feed" | "routes";

const SPORT_ICONS: Record<string, string> = {
  Ride: "🚴",
  MountainBikeRide: "🚵",
  GravelRide: "🪨",
  VirtualRide: "💻",
  Run: "🏃",
  Walk: "🚶",
};

function ClimbBadge({ category }: { category: number }) {
  if (category === 0) return null;
  const labels = ["", "Cat 4", "Cat 3", "Cat 2", "Cat 1", "HC"];
  const colors = ["", "bg-green-500", "bg-blue-500", "bg-orange-500", "bg-red-500", "bg-purple-600"];
  return (
    <span className={`text-xs font-bold text-white px-1.5 py-0.5 rounded ${colors[category] ?? "bg-gray-500"}`}>
      {labels[category]}
    </span>
  );
}

export default function Rides() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  const { data: clubInfo } = trpc.strava.clubInfo.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } =
    trpc.strava.clubActivities.useQuery(
      { perPage: 20, page: 1 },
      { enabled: isAuthenticated && tab === "feed", staleTime: 2 * 60 * 1000 }
    );

  const { data: routes, isLoading: routesLoading } =
    trpc.strava.routes.useQuery(
      { page: 1 },
      { enabled: isAuthenticated && tab === "routes", staleTime: 5 * 60 * 1000 }
    );

  const { data: routeDetail } = trpc.strava.routeDetail.useQuery(
    { routeId: selectedRoute! },
    { enabled: !!selectedRoute, staleTime: 10 * 60 * 1000 }
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
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
          MEMBER RIDES
        </h2>
        <p className="text-gray-400 mb-6">Sign in to view the Wheelhouse club ride feed, routes, and segments.</p>
        <a href={getLoginUrl()} className="bg-[#f1b53b] text-[#161d26] font-bold py-3 px-8 rounded-full">
          SIGN IN
        </a>
      </div>
    );
  }

  // Route detail view
  if (selectedRoute && routeDetail) {
    return (
      <div className="min-h-screen bg-[#161d26] pb-24">
        {/* Header */}
        <div className="bg-[#1e2a38] px-4 pt-12 pb-4">
          <button onClick={() => setSelectedRoute(null)} className="text-[#f1b53b] text-sm mb-3 flex items-center gap-1">
            ← Back to Routes
          </button>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            {routeDetail.name}
          </h1>
          {routeDetail.description && (
            <p className="text-gray-400 text-sm mt-1">{routeDetail.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 py-4">
          {[
            { icon: MapPin, label: "Distance", value: routeDetail.distanceFormatted },
            { icon: Mountain, label: "Elevation", value: routeDetail.elevationFormatted },
            { icon: Clock, label: "Est. Time", value: routeDetail.estimatedTimeFormatted },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#1e2a38] rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 text-[#f1b53b] mx-auto mb-1" />
              <p className="text-white font-bold text-base">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        {routeDetail.polyline && (
          <div className="mx-4 rounded-xl overflow-hidden bg-[#1e2a38]">
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&path=enc:${encodeURIComponent(routeDetail.polyline)}&path=color:0xf1b53b|weight:4&maptype=roadmap&style=element:geometry|color:0x1e2a38&style=element:labels.text.fill|color:0xf1b53b&key=AIzaSyPlaceholderKey`}
              alt="Route map"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="p-4">
              <a
                href={`https://www.strava.com/routes/${routeDetail.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#FC4C02] text-white font-bold py-3 rounded-xl w-full"
              >
                <ExternalLink className="w-4 h-4" />
                View on Strava
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161d26] pb-24">
      {/* Header */}
      <div className="bg-[#1e2a38] px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[#f1b53b] text-xs font-bold tracking-widest uppercase">Powered by Strava</p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
              RIDES
            </h1>
          </div>
          {/* Strava orange logo badge */}
          <div className="flex items-center gap-2">
            {clubInfo && (
              <div className="text-right">
                <p className="text-white text-sm font-bold">{clubInfo.name}</p>
                <p className="text-gray-400 text-xs">{clubInfo.member_count?.toLocaleString()} members</p>
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
            <p className="text-gray-400 text-sm">Recent rides from Wheelhouse members</p>
            <button
              onClick={() => refetchActivities()}
              className="text-[#f1b53b] p-1"
            >
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
                        <p className="text-white text-sm font-bold">{activity.athleteName}</p>
                        <p className="text-gray-500 text-xs">{activity.sportTypeLabel}</p>
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
                      <div className="flex items-center justify-center gap-1 text-[#f1b53b] mb-0.5">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <p className="text-white text-sm font-bold">{activity.distanceFormatted}</p>
                      <p className="text-gray-500 text-xs">Distance</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[#f1b53b] mb-0.5">
                        <Mountain className="w-3 h-3" />
                      </div>
                      <p className="text-white text-sm font-bold">{activity.elevationFormatted}</p>
                      <p className="text-gray-500 text-xs">Elevation</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[#f1b53b] mb-0.5">
                        <Clock className="w-3 h-3" />
                      </div>
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
                  onClick={() => setSelectedRoute(route.id)}
                  className="w-full bg-[#1e2a38] rounded-xl p-4 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-white font-bold truncate">{route.name}</p>
                      {route.description && (
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{route.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
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
