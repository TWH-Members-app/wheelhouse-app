import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Calendar, MapPin, Star, Users, Clock } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { key: "all", label: "All", icon: "🏠" },
  { key: "ride", label: "Rides", icon: "🚴" },
  { key: "workshop", label: "Workshops", icon: "🔧" },
  { key: "special", label: "Special", icon: "⭐" },
  { key: "camp", label: "Camps", icon: "⛺" },
];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  ride: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Ride" },
  workshop: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Workshop" },
  special: { color: "#a855f7", bg: "rgba(168,85,247,0.12)", label: "Special Event" },
  camp: { color: "#f1b53b", bg: "rgba(241,181,59,0.12)", label: "Camp" },
};

const CATEGORY_ICONS: Record<string, string> = {
  ride: "🚴", workshop: "🔧", special: "⭐", camp: "⛺",
};

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: events, isLoading } = trpc.events.list.useQuery({ category: activeCategory });

  return (
    <div className="min-h-screen" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #161d26 100%)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
          EVENTS
        </h1>
        <p className="text-sm" style={{ color: '#8a9ab0' }}>Members-only rides, workshops & camps</p>

        {/* Category Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={{
                background: activeCategory === key ? '#f1b53b' : 'rgba(255,255,255,0.06)',
                color: activeCategory === key ? '#161d26' : '#8a9ab0',
                border: activeCategory === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Oswald, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="px-4 space-y-4 pb-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: '#1a2332' }} />
            ))}
          </div>
        )}

        {!isLoading && events?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚴</p>
            <p className="font-semibold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>No events found</p>
            <p className="text-sm mt-1" style={{ color: '#8a9ab0' }}>Check back soon for upcoming events</p>
          </div>
        )}

        {events?.map((event) => {
          const cat = CATEGORY_CONFIG[event.category];
          const icon = CATEGORY_ICONS[event.category];
          const isMultiDay = event.endDate && new Date(event.endDate).getDate() !== new Date(event.startDate).getDate();

          return (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="rounded-2xl overflow-hidden transition-transform active:scale-98" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
                {/* Card Top */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Date Block */}
                    <div className="rounded-xl p-3 text-center flex-shrink-0 min-w-[52px]" style={{ background: 'rgba(241,181,59,0.1)', border: '1px solid rgba(241,181,59,0.2)' }}>
                      <p className="text-xs font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>
                        {format(new Date(event.startDate), "MMM").toUpperCase()}
                      </p>
                      <p className="text-xl font-bold leading-tight" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>
                        {format(new Date(event.startDate), "d")}
                      </p>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cat?.bg, color: cat?.color }}>
                          {icon} {cat?.label}
                        </span>
                        {event.pointsReward > 0 && (
                          <span className="text-xs font-bold flex items-center gap-0.5" style={{ color: '#f1b53b' }}>
                            <Star size={10} fill="#f1b53b" /> +{event.pointsReward}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base leading-tight" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} style={{ color: '#8a9ab0' }} />
                      <span className="text-xs" style={{ color: '#8a9ab0' }}>
                        {format(new Date(event.startDate), "h:mm a")}
                        {isMultiDay && ` — ${format(new Date(event.endDate!), "MMM d")}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} style={{ color: '#8a9ab0' }} />
                        <span className="text-xs truncate max-w-[140px]" style={{ color: '#8a9ab0' }}>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} style={{ color: '#8a9ab0' }} />
                    <span className="text-xs" style={{ color: '#8a9ab0' }}>
                      {event.maxAttendees ? `Max ${event.maxAttendees} members` : "Open attendance"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: event.isFree ? '#22c55e' : '#f1b53b' }}>
                      {event.isFree ? "FREE" : `$${parseFloat(event.price?.toString() ?? '0').toFixed(2)}`}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(241,181,59,0.15)', color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>
                      RSVP →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
