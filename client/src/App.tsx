import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Community from "./pages/Community";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import MemberCard from "./pages/MemberCard";
import BottomNav from "./components/BottomNav";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Loader2 } from "lucide-react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#161d26' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#f1b53b' }}>
            <span className="text-2xl font-bold" style={{ color: '#161d26', fontFamily: 'Oswald, sans-serif' }}>W</span>
          </div>
          <Loader2 className="animate-spin" style={{ color: '#f1b53b' }} size={24} />
        </div>
      </div>
    );
  }

  if (!user) {
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
    return null;
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <AuthGate>
      <div className="app-container">
        <div className="page-content">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/events" component={Events} />
            <Route path="/events/:id" component={EventDetail} />
            <Route path="/community" component={Community} />
            <Route path="/rewards" component={Rewards} />
            <Route path="/profile" component={Profile} />
            <Route path="/card" component={MemberCard} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <BottomNav />
      </div>
    </AuthGate>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
