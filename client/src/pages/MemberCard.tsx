import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Shield, Check } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const TIER_CONFIG = {
  refined: {
    label: "The Refined", shortLabel: "REFINED",
    gradient: "linear-gradient(135deg, #2a3a4a 0%, #1e2d3d 50%, #243040 100%)",
    accentColor: "#8a9ab0", borderColor: "rgba(138,154,176,0.4)",
    discount: "10% service / 15% apparel",
    perks: ["Priority service queue", "Free bike cleaning", "Members-only rides & events", "Early camp sign-up", "Free espresso on rides"],
  },
  elite: {
    label: "The Elite", shortLabel: "ELITE",
    gradient: "linear-gradient(135deg, #1e2a18 0%, #2a3520 50%, #1e2a18 100%)",
    accentColor: "#f1b53b", borderColor: "rgba(241,181,59,0.5)",
    discount: "25% off service, parts & apparel",
    perks: ["Annual bike fit", "Wheelhouse jersey", "25% off everything", "Etape & destination rides", "Annual drivetrain wax", "Free bike packing"],
  },
  ultimate: {
    label: "The Ultimate", shortLabel: "ULTIMATE",
    gradient: "linear-gradient(135deg, #2a1e08 0%, #3a2a10 50%, #2a1e08 100%)",
    accentColor: "#f1b53b", borderColor: "rgba(241,181,59,0.8)",
    discount: "25% off everything + bikes at cost",
    perks: ["Special edition jersey", "2 bikes at cost", "50% off WHCT events", "Bike loaner service", "Nimbl or Q36.5 shoes"],
  },
};

export default function MemberCard() {
  const { user } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery();

  const tier = (profile?.membershipTier ?? "refined") as keyof typeof TIER_CONFIG;
  const config = TIER_CONFIG[tier];
  const memberSince = profile?.memberSince ? format(new Date(profile.memberSince), "MMM yyyy") : "2024";
  const qrValue = `https://the-wheelhouse.com/member/${profile?.membershipNumber ?? "TWH-MEMBER"}`;

  return (
    <div className="min-h-screen px-4 pt-12 pb-6" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/">
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,181,59,0.1)', border: '1px solid rgba(241,181,59,0.2)' }}>
            <ArrowLeft size={16} style={{ color: '#f1b53b' }} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
            MEMBER CARD
          </h1>
          <p className="text-xs" style={{ color: '#8a9ab0' }}>Digital membership card</p>
        </div>
      </div>

      {/* The Card */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-2xl" style={{ background: config.gradient, border: `1px solid ${config.borderColor}`, boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${config.borderColor}` }}>
        {/* Card Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: config.accentColor, color: '#161d26', fontFamily: 'Oswald, sans-serif' }}>W</div>
                <span className="text-xs font-bold tracking-widest" style={{ color: config.accentColor, fontFamily: 'Oswald, sans-serif' }}>THE WHEELHOUSE</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>BIKES + WORKSHOP + COFFEE</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest" style={{ background: `${config.accentColor}25`, color: config.accentColor, border: `1px solid ${config.accentColor}60`, fontFamily: 'Oswald, sans-serif' }}>
              {config.shortLabel}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{profile?.name ?? user?.name}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Member since {memberSince}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>MEMBER NO.</p>
              <p className="text-sm font-mono font-bold" style={{ color: config.accentColor }}>{profile?.membershipNumber ?? "TWH-XXXXXX"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>POINTS</p>
              <p className="text-sm font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>{(profile?.pointsBalance ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mx-6 mb-6 rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="rounded-xl overflow-hidden p-2 flex-shrink-0" style={{ background: '#ffffff' }}>
            <QRCodeSVG value={qrValue} size={80} bgColor="#ffffff" fgColor="#161d26" level="M" />
          </div>
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: config.accentColor, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>SCAN IN-STORE</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>Present this QR code at The Wheelhouse to redeem your member discounts.</p>
          </div>
        </div>

        {/* Discount Banner */}
        <div className="mx-6 mb-6 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: `${config.accentColor}18`, border: `1px solid ${config.accentColor}35` }}>
          <Shield size={16} style={{ color: config.accentColor }} />
          <p className="text-xs font-semibold" style={{ color: config.accentColor, fontFamily: 'Oswald, sans-serif' }}>{config.discount}</p>
        </div>
      </div>

      {/* Perks List */}
      <div className="rounded-2xl p-5" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
          {config.label.toUpperCase()} PERKS
        </h3>
        <div className="space-y-3">
          {config.perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(241,181,59,0.15)' }}>
                <Check size={11} style={{ color: '#f1b53b' }} />
              </div>
              <p className="text-sm" style={{ color: '#c4cdd8' }}>{perk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Spend Tracker */}
      <div className="rounded-2xl p-5 mt-4" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.1)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
          ANNUAL SPEND TRACKER
        </h3>
        <div className="flex justify-between text-xs mb-2" style={{ color: '#8a9ab0' }}>
          <span>This year's spend</span>
          <span className="font-semibold" style={{ color: '#f1b53b' }}>${parseFloat(profile?.annualSpend?.toString() ?? '0').toFixed(2)}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min((parseFloat(profile?.annualSpend?.toString() ?? '0') / 1500) * 100, 100)}%`, background: 'linear-gradient(90deg, #f1b53b, #f5c96a)' }} />
        </div>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#22c55e', fontFamily: 'Oswald, sans-serif' }}>${parseFloat(profile?.totalSavings?.toString() ?? '0').toFixed(2)}</p>
            <p className="text-xs" style={{ color: '#8a9ab0' }}>Total Saved</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>{(profile?.pointsBalance ?? 0).toLocaleString()}</p>
            <p className="text-xs" style={{ color: '#8a9ab0' }}>Points Balance</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>${((profile?.pointsBalance ?? 0) / 100).toFixed(2)}</p>
            <p className="text-xs" style={{ color: '#8a9ab0' }}>Credit Value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
