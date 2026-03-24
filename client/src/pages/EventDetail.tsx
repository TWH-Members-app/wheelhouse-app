import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, MapPin, Users, Star, Clock, CheckCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  ride: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Group Ride", icon: "🚴" },
  workshop: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Workshop", icon: "🔧" },
  special: { color: "#a855f7", bg: "rgba(168,85,247,0.12)", label: "Special Event", icon: "⭐" },
  camp: { color: "#f1b53b", bg: "rgba(241,181,59,0.12)", label: "Camp", icon: "⛺" },
};

function buildCalendarUrls(event: { title: string; description?: string | null; location?: string | null; startDate: Date; endDate?: Date | null }) {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(event.description ?? "")}&location=${encodeURIComponent(event.location ?? "")}`;

  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description ?? ""}`,
    `LOCATION:${event.location ?? ""}`,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\n");
  const icsBlob = `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;

  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(event.description ?? "")}&location=${encodeURIComponent(event.location ?? "")}`;

  return { google, ics: icsBlob, outlook };
}

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id ?? "0");
  const { data, isLoading } = trpc.events.get.useQuery({ id: eventId });
  const { data: rsvpStatus, refetch: refetchRsvp } = trpc.events.getRsvpStatus.useQuery({ eventId });
  const utils = trpc.useUtils();

  const rsvpMutation = trpc.events.rsvp.useMutation({
    onSuccess: (result) => {
      refetchRsvp();
      utils.profile.get.invalidate();
      if (result.registered) {
        toast.success(`You're registered! +${data?.event?.pointsReward ?? 0} points earned 🎉`);
      } else {
        toast.info("Registration cancelled");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#161d26' }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent" style={{ borderColor: '#f1b53b', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#161d26' }}>
        <p className="text-4xl mb-3">😕</p>
        <p className="font-bold text-lg" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>Event not found</p>
        <Link href="/events"><button className="mt-4 text-sm" style={{ color: '#f1b53b' }}>← Back to Events</button></Link>
      </div>
    );
  }

  const { event, attendeeCount } = data;
  const cat = CATEGORY_CONFIG[event.category];
  const isRegistered = rsvpStatus?.registered ?? false;
  const calUrls = buildCalendarUrls(event as any);
  const isMultiDay = event.endDate && new Date(event.endDate).getDate() !== new Date(event.startDate).getDate();
  const spotsLeft = event.maxAttendees ? event.maxAttendees - attendeeCount : null;

  return (
    <div className="min-h-screen" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-6" style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #161d26 100%)' }}>
        <Link href="/events">
          <button className="flex items-center gap-2 mb-6" style={{ color: '#8a9ab0' }}>
            <ArrowLeft size={16} />
            <span className="text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>Events</span>
          </button>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: cat?.bg, color: cat?.color }}>
            {cat?.icon} {cat?.label}
          </span>
          {event.pointsReward > 0 && (
            <span className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(241,181,59,0.15)', color: '#f1b53b' }}>
              <Star size={10} fill="#f1b53b" /> +{event.pointsReward} pts
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight mb-4" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>
          {event.title}
        </h1>

        {/* Event Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: '#f1b53b' }} />
            <span className="text-sm" style={{ color: '#c4cdd8' }}>
              {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
              {isMultiDay && ` — ${format(new Date(event.endDate!), "MMMM d, yyyy")}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: '#f1b53b' }} />
            <span className="text-sm" style={{ color: '#c4cdd8' }}>
              {format(new Date(event.startDate), "h:mm a")}
              {event.endDate && !isMultiDay && ` — ${format(new Date(event.endDate), "h:mm a")}`}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: '#f1b53b' }} />
              <span className="text-sm" style={{ color: '#c4cdd8' }}>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users size={14} style={{ color: '#f1b53b' }} />
            <span className="text-sm" style={{ color: '#c4cdd8' }}>
              {attendeeCount} registered
              {spotsLeft !== null && spotsLeft > 0 && ` · ${spotsLeft} spots left`}
              {spotsLeft === 0 && " · FULL"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-6">
        {/* Description */}
        {event.description && (
          <div className="rounded-2xl p-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>ABOUT THIS EVENT</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#c4cdd8' }}>{event.description}</p>
          </div>
        )}

        {/* Cost */}
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
          <div>
            <p className="text-xs font-bold mb-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>COST</p>
            <p className="text-xl font-bold" style={{ color: event.isFree ? '#22c55e' : '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>
              {event.isFree ? "FREE" : `$${parseFloat(event.price?.toString() ?? '0').toFixed(2)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold mb-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>POINTS REWARD</p>
            <p className="text-xl font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>+{event.pointsReward}</p>
          </div>
        </div>

        {/* RSVP Button */}
        <button
          onClick={() => rsvpMutation.mutate({ eventId })}
          disabled={rsvpMutation.isPending || (spotsLeft === 0 && !isRegistered)}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: isRegistered ? 'rgba(34,197,94,0.15)' : spotsLeft === 0 ? 'rgba(255,255,255,0.06)' : '#f1b53b',
            color: isRegistered ? '#22c55e' : spotsLeft === 0 ? '#8a9ab0' : '#161d26',
            border: isRegistered ? '1px solid rgba(34,197,94,0.3)' : 'none',
            fontFamily: 'Oswald, sans-serif',
            letterSpacing: '0.08em',
          }}
        >
          {isRegistered ? (
            <><CheckCircle size={18} /> REGISTERED — TAP TO CANCEL</>
          ) : spotsLeft === 0 ? (
            "EVENT FULL"
          ) : rsvpMutation.isPending ? (
            "REGISTERING..."
          ) : (
            "REGISTER FOR THIS EVENT"
          )}
        </button>

        {/* Add to Calendar */}
        {isRegistered && (
          <div className="rounded-2xl p-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
              ADD TO CALENDAR
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Google", url: calUrls.google, emoji: "📅" },
                { label: "Apple", url: calUrls.ics, emoji: "🍎" },
                { label: "Outlook", url: calUrls.outlook, emoji: "📧" },
              ].map(({ label, url, emoji }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" download={label === "Apple" ? `${event.title}.ics` : undefined}>
                  <button className="w-full py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all" style={{ background: 'rgba(241,181,59,0.1)', border: '1px solid rgba(241,181,59,0.2)' }}>
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs font-medium" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>{label}</span>
                  </button>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
