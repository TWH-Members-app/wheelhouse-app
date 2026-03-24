import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Bell, Mail, Shield, CreditCard, ChevronRight, LogOut, Check, Star, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

const TIER_CONFIG = {
  refined: { label: "The Refined", color: "#8a9ab0", bg: "rgba(138,154,176,0.12)", border: "rgba(138,154,176,0.3)", nextTier: "The Elite", nextSpend: 1500 },
  elite: { label: "The Elite", color: "#f1b53b", bg: "rgba(241,181,59,0.12)", border: "rgba(241,181,59,0.4)", nextTier: "The Ultimate", nextSpend: 3000 },
  ultimate: { label: "The Ultimate", color: "#f1b53b", bg: "rgba(241,181,59,0.18)", border: "rgba(241,181,59,0.7)", nextTier: null, nextSpend: null },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profile, refetch } = trpc.profile.get.useQuery();
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(true);
  const [notifyRewards, setNotifyRewards] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  useEffect(() => {
    if (profile) {
      setNotifyEvents(profile.notifyEvents ?? true);
      setNotifyCommunity(profile.notifyCommunity ?? true);
      setNotifyRewards(profile.notifyRewards ?? true);
      setNotifyEmail(profile.notifyEmail ?? true);
    }
  }, [profile]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Preferences saved"); },
    onError: (err) => toast.error(err.message),
  });

  const handleToggle = (field: string, value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  const tier = (profile?.membershipTier ?? "refined") as keyof typeof TIER_CONFIG;
  const tierConfig = TIER_CONFIG[tier];
  const annualSpend = parseFloat(profile?.annualSpend?.toString() ?? '0');
  const totalSavings = parseFloat(profile?.totalSavings?.toString() ?? '0');
  const spendProgress = tierConfig.nextSpend ? Math.min((annualSpend / tierConfig.nextSpend) * 100, 100) : 100;

  return (
    <div className="min-h-screen" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-6" style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #161d26 100%)' }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
          PROFILE
        </h1>

        {/* Member Identity Card */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #243040 100%)', border: `1px solid ${tierConfig.border}` }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: 'rgba(241,181,59,0.2)', color: '#f1b53b', fontFamily: 'Oswald, sans-serif', border: `2px solid ${tierConfig.color}40` }}>
              {(profile?.name ?? user?.name ?? "M").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>
                {profile?.name ?? user?.name}
              </h2>
              <p className="text-sm" style={{ color: '#8a9ab0' }}>{user?.email}</p>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: tierConfig.bg, border: `1px solid ${tierConfig.border}` }}>
                <Star size={11} style={{ color: tierConfig.color }} fill={tierConfig.color} />
                <span className="text-xs font-bold" style={{ color: tierConfig.color, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                  {tierConfig.label.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Member Number */}
          <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>MEMBER NO.</span>
            <span className="text-sm font-mono font-bold" style={{ color: tierConfig.color }}>{profile?.membershipNumber ?? "TWH-XXXXXX"}</span>
          </div>

          {/* View Card CTA */}
          <Link href="/card">
            <button className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-all" style={{ background: 'rgba(241,181,59,0.12)', color: '#f1b53b', border: '1px solid rgba(241,181,59,0.25)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
              <CreditCard size={16} />
              VIEW DIGITAL MEMBER CARD
            </button>
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-6">
        {/* Spend & Tier Progress */}
        <div className="rounded-2xl p-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: '#f1b53b' }} />
            <h3 className="text-sm font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>ANNUAL SPEND TRACKER</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(241,181,59,0.08)' }}>
              <p className="text-xl font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>${annualSpend.toFixed(0)}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8a9ab0' }}>This Year</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.08)' }}>
              <p className="text-xl font-bold" style={{ color: '#22c55e', fontFamily: 'Oswald, sans-serif' }}>${totalSavings.toFixed(0)}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8a9ab0' }}>Total Saved</p>
            </div>
          </div>

          {tierConfig.nextTier && (
            <>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8a9ab0' }}>
                <span>Progress to {tierConfig.nextTier}</span>
                <span>${annualSpend.toFixed(0)} / ${tierConfig.nextSpend}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${spendProgress}%`, background: 'linear-gradient(90deg, #f1b53b, #f5c96a)' }} />
              </div>
              <p className="text-xs mt-2" style={{ color: '#8a9ab0' }}>
                ${Math.max(0, (tierConfig.nextSpend ?? 0) - annualSpend).toFixed(0)} more to unlock {tierConfig.nextTier}
              </p>
            </>
          )}
          {!tierConfig.nextTier && (
            <div className="flex items-center gap-2 mt-2">
              <Check size={14} style={{ color: '#22c55e' }} />
              <p className="text-xs" style={{ color: '#22c55e' }}>You're at the highest tier — The Ultimate!</p>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="rounded-2xl p-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} style={{ color: '#f1b53b' }} />
            <h3 className="text-sm font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>NOTIFICATIONS</h3>
          </div>

          <div className="space-y-1">
            {[
              { key: "notifyEvents", label: "Events & Rides", desc: "New events, reminders, RSVP confirmations", icon: <Calendar size={14} />, value: notifyEvents, setter: setNotifyEvents },
              { key: "notifyCommunity", label: "Community", desc: "New posts, comments, replies", icon: <Bell size={14} />, value: notifyCommunity, setter: setNotifyCommunity },
              { key: "notifyRewards", label: "Rewards & Points", desc: "Points earned, tier upgrades, redemptions", icon: <Star size={14} />, value: notifyRewards, setter: setNotifyRewards },
              { key: "notifyEmail", label: "Email Notifications", desc: "Receive updates via email", icon: <Mail size={14} />, value: notifyEmail, setter: setNotifyEmail },
            ].map(({ key, label, desc, icon, value, setter }) => (
              <div key={key} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(241,181,59,0.1)', color: '#f1b53b' }}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#8a9ab0' }}>{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newVal = !value;
                    setter(newVal);
                    handleToggle(key, newVal);
                  }}
                  className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                  style={{ background: value ? '#f1b53b' : 'rgba(255,255,255,0.12)' }}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300" style={{ background: '#ffffff', left: value ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Info */}
        <div className="rounded-2xl p-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: '#f1b53b' }} />
            <h3 className="text-sm font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>MEMBERSHIP</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Current Tier", value: tierConfig.label },
              { label: "Member Since", value: profile?.memberSince ? new Date(profile.memberSince).getFullYear().toString() : "2024" },
              { label: "Points Balance", value: `${(profile?.pointsBalance ?? 0).toLocaleString()} pts` },
              { label: "Store Credit", value: `$${((profile?.pointsBalance ?? 0) / 100).toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#8a9ab0' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{value}</span>
              </div>
            ))}
          </div>
          <a href="https://the-wheelhouse.com/pages/the-wheelhouse-membership" target="_blank" rel="noopener noreferrer">
            <button className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(241,181,59,0.1)', color: '#f1b53b', border: '1px solid rgba(241,181,59,0.2)', fontFamily: 'Oswald, sans-serif' }}>
              View Membership Details <ChevronRight size={14} />
            </button>
          </a>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => logout()}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}
        >
          <LogOut size={16} />
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
