import { useState } from "react";
import { Wrench, Clock, Star, ChevronRight, ArrowLeft, Calendar, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const HUBTIGER_URL =
  "https://bookings.hubtiger.com/bikes?shop=HUB.D307AF7BC654413AA1DB753BB0751BC8CEC22D255E66481B8F60645CDB6806FC.TIGER&lang=en";

const serviceTypes = [
  {
    id: "basic",
    name: "Basic Tune-Up",
    description: "Gear adjustment, brake check, tyre inflation & safety inspection",
    duration: "1–2 hrs",
    points: 50,
    icon: "🔧",
    popular: false,
  },
  {
    id: "full",
    name: "Full Service",
    description: "Complete strip-down, clean, lubrication, adjustment & full safety check",
    duration: "3–5 hrs",
    points: 100,
    icon: "⚙️",
    popular: true,
  },
  {
    id: "fitting",
    name: "Bike Fitting",
    description: "Professional bike fit to optimise your position, comfort & performance",
    duration: "1.5–2 hrs",
    points: 75,
    icon: "📐",
    popular: false,
  },
  {
    id: "custom",
    name: "Custom / Assessment",
    description: "Describe your specific issue and our technicians will assess and advise",
    duration: "Varies",
    points: 50,
    icon: "💬",
    popular: false,
  },
];

export default function ServiceBooking() {
  const [view, setView] = useState<"intro" | "booking">("intro");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const bookingUrl = selectedService
    ? `${HUBTIGER_URL}&serviceType=${selectedService}`
    : HUBTIGER_URL;

  if (view === "booking") {
    return (
      <div className="flex flex-col h-screen bg-[#161d26]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-[#161d26] border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setView("intro")}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Book a Service
            </h1>
            <p className="text-white/50 text-xs">Powered by HubTiger</p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-[#f1b53b]/20 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-[#f1b53b]" fill="#f1b53b" />
            <span className="text-[#f1b53b] text-xs font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Earn Points
            </span>
          </div>
        </div>

        {/* iFrame */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={bookingUrl}
            frameBorder="0"
            allow="geolocation"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="HubTiger Service Booking"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161d26] pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1
              className="text-white text-2xl font-bold tracking-wide"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}
            >
              BOOK A SERVICE
            </h1>
            <p className="text-white/50 text-sm">Workshop booking for members</p>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#f1b53b] to-[#d4941f] p-5 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[#161d26] text-xs font-semibold uppercase tracking-widest mb-1">
                Member Benefit
              </p>
              <h2
                className="text-[#161d26] text-xl font-bold leading-tight mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                PRIORITY WORKSHOP BOOKING
              </h2>
              <p className="text-[#161d26]/70 text-sm leading-relaxed">
                As a Wheelhouse member, your bike gets priority attention from our expert technicians.
              </p>
            </div>
            <div className="ml-4 w-16 h-16 bg-[#161d26]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Wrench className="w-8 h-8 text-[#161d26]" />
            </div>
          </div>

          {/* Points earn note */}
          <div className="mt-4 flex items-center gap-2 bg-[#161d26]/20 rounded-xl px-3 py-2">
            <CheckCircle className="w-4 h-4 text-[#161d26]" />
            <span className="text-[#161d26] text-xs font-semibold">
              Earn up to 100 reward points when you book a service
            </span>
          </div>
        </div>

        {/* Service type selector */}
        <div className="mb-6">
          <h3
            className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Select a Service Type
          </h3>
          <div className="space-y-3">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`w-full text-left rounded-2xl p-4 border transition-all ${
                  selectedService === service.id
                    ? "bg-[#f1b53b]/15 border-[#f1b53b]"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{service.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-bold text-sm ${
                          selectedService === service.id ? "text-[#f1b53b]" : "text-white"
                        }`}
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {service.name}
                      </span>
                      {service.popular && (
                        <span className="bg-[#f1b53b] text-[#161d26] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-2">{service.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span className="text-white/40 text-xs">{service.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#f1b53b]" fill="#f1b53b" />
                        <span className="text-[#f1b53b] text-xs font-semibold">+{service.points} pts</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                      selectedService === service.id
                        ? "border-[#f1b53b] bg-[#f1b53b]"
                        : "border-white/20"
                    }`}
                  >
                    {selectedService === service.id && (
                      <div className="w-2 h-2 rounded-full bg-[#161d26]" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* What to expect */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
          <h3
            className="text-white font-bold text-sm mb-3"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            WHAT TO EXPECT
          </h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Select your service type and preferred date" },
              { step: "2", text: "Drop off your bike at the Wheelhouse workshop" },
              { step: "3", text: "Get SMS/email updates as work progresses" },
              { step: "4", text: "Collect your bike and earn reward points" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#f1b53b] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#161d26] text-xs font-bold">{item.step}</span>
                </div>
                <span className="text-white/60 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setView("booking")}
          className="w-full bg-[#f1b53b] text-[#161d26] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all active:scale-95"
          style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}
        >
          <Calendar className="w-5 h-5" />
          {selectedService
            ? `BOOK ${serviceTypes.find((s) => s.id === selectedService)?.name.toUpperCase()}`
            : "CHOOSE DATE & TIME"}
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-center text-white/30 text-xs mt-3">
          Bookings are managed securely via HubTiger
        </p>
      </div>
    </div>
  );
}
