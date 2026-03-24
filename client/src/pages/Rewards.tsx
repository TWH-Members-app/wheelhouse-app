import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Star, Zap, Gift, Users, Copy, Check, ChevronRight, TrendingUp, ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const POINTS_GUIDE = [
  { icon: "🛒", label: "Purchase", desc: "$1 spent", pts: 10, color: "#22c55e" },
  { icon: "🚴", label: "Group Ride", desc: "Per ride attended", pts: 100, color: "#3b82f6" },
  { icon: "🔧", label: "Workshop", desc: "Per workshop attended", pts: 250, color: "#a855f7" },
  { icon: "⭐", label: "Special Event", desc: "Per event attended", pts: 500, color: "#f59e0b" },
  { icon: "⛺", label: "Camp", desc: "Per camp attended", pts: 1000, color: "#f1b53b" },
  { icon: "👥", label: "Referral", desc: "Per friend who joins", pts: 2000, color: "#ef4444" },
];

const SOURCE_ICONS: Record<string, string> = {
  purchase: "🛒", ride: "🚴", workshop: "🔧", special_event: "⭐", camp: "⛺",
  referral: "👥", redemption: "🎁",
};

export default function Rewards() {
  const { user } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: history } = trpc.rewards.history.useQuery();
  const { data: referrals } = trpc.referrals.list.useQuery();
  const [redeemAmount, setRedeemAmount] = useState(1000);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "earn" | "refer">("history");

  const utils = trpc.useUtils();
  const redeemMutation = trpc.rewards.redeem.useMutation({
    onSuccess: (result) => {
      utils.profile.get.invalidate();
      utils.rewards.history.invalidate();
      toast.success(`Redeemed! You have $${result.creditValue.toFixed(2)} store credit 🎉`);
    },
    onError: (err) => toast.error(err.message),
  });

  const referralLink = `https://the-wheelhouse.com/join?ref=${profile?.referralCode ?? ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Referral link copied!");
  };

  const balance = profile?.pointsBalance ?? 0;
  const creditValue = (balance / 100).toFixed(2);
  const canRedeem = balance >= 1000;

  const totalEarned = history?.filter(t => t.type === 'earn').reduce((s, t) => s + t.points, 0) ?? 0;
  const totalRedeemed = history?.filter(t => t.type === 'redeem').reduce((s, t) => s + Math.abs(t.points), 0) ?? 0;

  return (
    <div className="min-h-screen" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #161d26 100%)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
          REWARDS
        </h1>
        <p className="text-sm mb-4" style={{ color: '#8a9ab0' }}>Earn points, redeem rewards</p>

        {/* Points Balance Card */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #243040 100%)', border: '1px solid rgba(241,181,59,0.25)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
                CURRENT BALANCE
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>
                  {balance.toLocaleString()}
                </span>
                <span className="text-sm mb-1" style={{ color: '#8a9ab0' }}>pts</span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#22c55e' }}>= ${creditValue} store credit</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,181,59,0.15)', border: '1px solid rgba(241,181,59,0.3)' }}>
              <Star size={28} style={{ color: '#f1b53b' }} fill="#f1b53b" />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs mb-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif' }}>TOTAL EARNED</p>
              <p className="text-lg font-bold" style={{ color: '#22c55e', fontFamily: 'Oswald, sans-serif' }}>{totalEarned.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs mb-0.5" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif' }}>TOTAL REDEEMED</p>
              <p className="text-lg font-bold" style={{ color: '#ef4444', fontFamily: 'Oswald, sans-serif' }}>{totalRedeemed.toLocaleString()}</p>
            </div>
          </div>

          {/* Redeem Section */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>REDEEM POINTS</p>
            <p className="text-xs mb-3" style={{ color: '#8a9ab0' }}>1,000 pts = $10.00 store credit (minimum 1,000 pts)</p>
            <div className="flex gap-2">
              <select
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(Number(e.target.value))}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(241,181,59,0.2)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
              >
                {[1000, 2000, 3000, 5000, 10000].filter(v => v <= balance).map(v => (
                  <option key={v} value={v} style={{ background: '#1e2a38' }}>
                    {v.toLocaleString()} pts = ${(v / 100).toFixed(2)}
                  </option>
                ))}
                {balance < 1000 && <option value={1000} style={{ background: '#1e2a38' }}>Need {(1000 - balance).toLocaleString()} more pts</option>}
              </select>
              <button
                onClick={() => redeemMutation.mutate({ points: redeemAmount })}
                disabled={!canRedeem || redeemMutation.isPending}
                className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: canRedeem ? '#f1b53b' : 'rgba(255,255,255,0.08)', color: canRedeem ? '#161d26' : '#8a9ab0', fontFamily: 'Oswald, sans-serif', opacity: redeemMutation.isPending ? 0.7 : 1 }}
              >
                {redeemMutation.isPending ? "..." : "REDEEM"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1a2332' }}>
          {([
            { key: "history", label: "History" },
            { key: "earn", label: "How to Earn" },
            { key: "refer", label: "Refer" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === key ? '#f1b53b' : 'transparent',
                color: activeTab === key ? '#161d26' : '#8a9ab0',
                fontFamily: 'Oswald, sans-serif',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-2">
            {history?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">⭐</p>
                <p className="font-semibold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>No activity yet</p>
                <p className="text-sm mt-1" style={{ color: '#8a9ab0' }}>Attend events and make purchases to earn points</p>
              </div>
            )}
            {history?.map((tx) => (
              <div key={tx.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: tx.type === 'earn' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                    {SOURCE_ICONS[tx.source] ?? "⭐"}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{tx.description}</p>
                    <p className="text-xs" style={{ color: '#8a9ab0' }}>{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: tx.type === 'earn' ? '#22c55e' : '#ef4444' }}>
                  {tx.type === 'earn' ? '+' : ''}{tx.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Earn Guide Tab */}
        {activeTab === "earn" && (
          <div className="space-y-3">
            <p className="text-sm mb-4" style={{ color: '#8a9ab0' }}>Here's how to earn Wheelhouse Points:</p>
            {POINTS_GUIDE.map(({ icon, label, desc, pts, color }) => (
              <div key={label} className="rounded-xl p-4 flex items-center justify-between" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}18` }}>
                    {icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#8a9ab0' }}>{desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base" style={{ color, fontFamily: 'Oswald, sans-serif' }}>+{pts}</p>
                  <p className="text-xs" style={{ color: '#8a9ab0' }}>pts</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl p-4 mt-2" style={{ background: 'rgba(241,181,59,0.08)', border: '1px solid rgba(241,181,59,0.2)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>REDEMPTION RATE</p>
              <p className="text-sm" style={{ color: '#c4cdd8' }}>Every 1,000 points = <span style={{ color: '#22c55e', fontWeight: 'bold' }}>$10.00</span> store credit</p>
            </div>
          </div>
        )}

        {/* Refer Tab */}
        {activeTab === "refer" && (
          <div className="space-y-4">
            {/* Hero */}
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #f1b53b 0%, #d99e28 100%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} style={{ color: '#161d26' }} />
                <p className="font-bold text-lg" style={{ color: '#161d26', fontFamily: 'Oswald, sans-serif' }}>REFER A FRIEND</p>
              </div>
              <p className="text-sm mb-1" style={{ color: 'rgba(22,29,38,0.75)' }}>Earn <strong>2,000 points</strong> for every friend who joins The Wheelhouse as a member.</p>
              <p className="text-xs" style={{ color: 'rgba(22,29,38,0.6)' }}>That's $20 in store credit per referral!</p>
            </div>

            {/* Referral Link */}
            <div className="rounded-2xl p-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.15)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#8a9ab0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>YOUR REFERRAL LINK</p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl px-3 py-2.5 text-xs overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#8a9ab0', fontFamily: 'monospace' }}>
                  <span className="truncate block">{referralLink}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all"
                  style={{ background: copied ? 'rgba(34,197,94,0.2)' : '#f1b53b', color: copied ? '#22c55e' : '#161d26', fontFamily: 'Oswald, sans-serif', border: copied ? '1px solid rgba(34,197,94,0.4)' : 'none' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>

            {/* Referral History */}
            <div>
              <p className="text-sm font-bold mb-3" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>YOUR REFERRALS</p>
              {referrals?.length === 0 ? (
                <div className="text-center py-8 rounded-2xl" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.08)' }}>
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-sm font-semibold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>No referrals yet</p>
                  <p className="text-xs mt-1" style={{ color: '#8a9ab0' }}>Share your link to start earning!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals?.map((ref) => (
                    <div key={ref.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.08)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{ref.referredEmail ?? "Invited friend"}</p>
                        <p className="text-xs" style={{ color: '#8a9ab0' }}>{formatDistanceToNow(new Date(ref.createdAt), { addSuffix: true })}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-bold" style={{
                        background: ref.status === 'rewarded' ? 'rgba(34,197,94,0.15)' : 'rgba(241,181,59,0.15)',
                        color: ref.status === 'rewarded' ? '#22c55e' : '#f1b53b',
                        fontFamily: 'Oswald, sans-serif',
                      }}>
                        {ref.status === 'rewarded' ? '+2,000 pts' : ref.status === 'joined' ? 'JOINED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
