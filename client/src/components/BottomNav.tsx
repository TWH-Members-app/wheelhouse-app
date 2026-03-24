import { useLocation, Link } from "wouter";
import { Home, Calendar, MessageCircle, Star, User, Wrench } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/events", icon: Calendar, label: "Events" },
  { path: "/service", icon: Wrench, label: "Service" },
  { path: "/community", icon: MessageCircle, label: "Community" },
  { path: "/rewards", icon: Star, label: "Rewards" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === "/" ? location === "/" : location.startsWith(path);
          return (
            <Link key={path} href={path}>
              <button className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]"
                style={{ color: isActive ? '#f1b53b' : '#8a9ab0' }}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium tracking-wide" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.05em' }}>
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-1 h-1 rounded-full" style={{ background: '#f1b53b' }} />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
