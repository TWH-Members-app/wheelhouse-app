import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Bell, ChevronRight, MapPin, Calendar, Star, Users, Zap, Wrench } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const TIER_CONFIG = {
  refined: { label: "The Refined", color: "#8a9ab0", bg: "rgba(138,154,176,0.15)", border: "rgba(138,154,176,0.3)" },
  elite: { label: "The Elite", color: "#f1b53b", bg: "rgba(241,181,59,0.12)", border: "rgba(241,181,59,0.4)" },
  ultimate: { label: "The Ultimate", color: "#f1b53b", bg: "rgba(241,181,59,0.18)", border: "rgba(241,181,59,0.7)" },
};

const CATEGORY_CONFIG = {
  ride: { label: "Ride", color: "#22c55e", icon: "🚴" },
  workshop: { label: "Workshop", color: "#3b82f6", icon: "🔧" },
  special: { label: "Special Event", color: "#a855f7", icon: "⭐" },
  camp: { label: "Camp", color: "#f1b53b", icon: "⛺" },
};

export default function Home() {
  const { user } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: events } = trpc.events.list.useQuery({ category: "all" });
  const { data: pointsHistory } = trpc.rewards.history.useQuery();

  const tier = (profile?.membershipTier ?? "refined") as keyof typeof TIER_CONFIG;
  const tierConfig = TIER_CONFIG[tier];
  const upcomingEvents = events?.slice(0, 3) ?? [];
  const recentPoints = pointsHistory?.slice(0, 3) ?? [];
  const totalEarned = pointsHistory?.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.points, 0) ?? 0;

  return (
    <div className="min-h-screen" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #161d26 100%)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
              WELCOME BACK
            </p>
            <h1 className="text-2xl font-bold mt-0.5" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>
              {profile?.name ?? user?.name ?? "Member"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: tierConfig.bg, color: tierConfig.color, border: `1px solid ${tierConfig.border}`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
              {tierConfig.label.toUpperCase()}
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,181,59,0.1)', border: '1px solid rgba(241,181,59,0.2)' }}>
              <Bell size={16} style={{ color: '#f1b53b' }} />
            </button>
          </div>
        </div>

        {/* Points Balance Hero */}
        <div className="rounded-2xl p-5 mb-1" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #243040 100%)', border: '1px solid rgba(241,181,59,0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
                WHEELHOUSE POINTS
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>
                  {(profile?.pointsBalance ?? 0).toLocaleString()}
                </span>
                <span className="text-sm mb-1" style={{ color: '#8a9ab0' }}>pts</span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#8a9ab0' }}>
                = ${((profile?.pointsBalance ?? 0) / 100).toFixed(2)} store credit
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,181,59,0.15)', border: '1px solid rgba(241,181,59,0.3)' }}>
                <Star size={24} style={{ color: '#f1b53b' }} fill="#f1b53b" />
              </div>
              <Link href="/card">
                <button className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: '#f1b53b', color: '#161d26', fontFamily: 'Oswald, sans-serif' }}>
                  My Card <ChevronRight size={12} />
                </button>
              </Link>
            </div>
          </div>
          {/* Progress to next redemption */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8a9ab0' }}>
              <span>Next redemption</span>
              <span>{Math.min(profile?.pointsBalance ?? 0, 1000)}/1,000 pts</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(((profile?.pointsBalance ?? 0) / 1000) * 100, 100)}%`, background: 'linear-gradient(90deg, #f1b53b, #f5c96a)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-4">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>{totalEarned.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif' }}>PTS EARNED</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#22c55e', fontFamily: 'Oswald, sans-serif' }}>${parseFloat(profile?.totalSavings?.toString() ?? '0').toFixed(0)}</p>
            <p className="text-xs mt-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif' }}>SAVED</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
            <p className="text-lg font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>${parseFloat(profile?.annualSpend?.toString() ?? '0').toFixed(0)}</p>
            <p className="text-xs mt-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif' }}>SPENT</p>
          </div>
        </div>

        {/* Service Booking Banner */}
        <Link href="/service">
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #1e2a3a 100%)', border: '1px solid rgba(241,181,59,0.25)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(241,181,59,0.15)' }}>
              <Wrench size={22} style={{ color: '#f1b53b' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>BOOK A SERVICE</p>
              <p className="text-xs mt-0.5" style={{ color: '#8a9ab0' }}>Priority workshop booking for members</p>
            </div>
            <ChevronRight size={18} style={{ color: '#f1b53b' }} />
          </div>
        </Link>

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
              UPCOMING EVENTS
            </h2>
            <Link href="/events">
              <button className="text-xs font-medium flex items-center gap-1" style={{ color: '#f1b53b' }}>
                See all <ChevronRight size={12} />
              </button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const cat = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG];
              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="rounded-xl p-4 flex items-center gap-4 active:scale-98 transition-transform" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(241,181,59,0.1)' }}>
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={11} style={{ color: '#8a9ab0' }} />
                        <span className="text-xs" style={{ color: '#8a9ab0' }}>
                          {format(new Date(event.startDate), "EEE, MMM d")}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cat?.color}20`, color: cat?.color }}>
                          {cat?.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold" style={{ color: '#f1b53b' }}>+{event.pointsReward}</span>
                      <span className="text-xs" style={{ color: '#8a9ab0' }}>pts</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Points Activity */}
        {recentPoints.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
                RECENT ACTIVITY
              </h2>
              <Link href="/rewards">
                <button className="text-xs font-medium flex items-center gap-1" style={{ color: '#f1b53b' }}>
                  View all <ChevronRight size={12} />
                </button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentPoints.map((tx) => (
                <div key={tx.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: tx.type === 'earn' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                      <Zap size={14} style={{ color: tx.type === 'earn' ? '#22c55e' : '#ef4444' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{tx.description}</p>
                      <p className="text-xs" style={{ color: '#8a9ab0' }}>{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: tx.type === 'earn' ? '#22c55e' : '#ef4444' }}>
                    {tx.type === 'earn' ? '+' : ''}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refer a Friend CTA */}
        <Link href="/rewards">
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f1b53b 0%, #d99e28 100%)' }}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} style={{ color: '#161d26' }} />
                <p className="text-sm font-bold" style={{ color: '#161d26', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>REFER A FRIEND</p>
              </div>
              <p className="text-xs" style={{ color: 'rgba(22,29,38,0.7)' }}>Earn 2,000 points when your friend joins</p>
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: '#161d26', color: '#f1b53b' }}>
                Share invite link <ChevronRight size={12} />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
