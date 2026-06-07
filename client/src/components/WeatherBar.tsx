import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Wind, Droplets, Sun, ChevronDown, ChevronUp, MapPin } from "lucide-react";

// Map WMO weather codes to emoji icons
function wmoIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌦️";
  if (code >= 61 && code <= 65) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code === 95) return "⛈️";
  if (code >= 96 && code <= 99) return "⛈️";
  return "🌡️";
}

function uvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-green-600" };
  if (uv <= 5) return { label: "Moderate", color: "text-yellow-600" };
  if (uv <= 7) return { label: "High", color: "text-orange-500" };
  if (uv <= 10) return { label: "Very High", color: "text-red-600" };
  return { label: "Extreme", color: "text-purple-700" };
}

function shortDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function WeatherBar() {
  const [expanded, setExpanded] = useState(false);
  const { data: weather, isLoading, isError } = trpc.weather.getCurrent.useQuery(undefined, {
    staleTime: 25 * 60 * 1000, // treat as fresh for 25 min
    refetchInterval: 30 * 60 * 1000, // refetch every 30 min
  });

  if (isLoading) {
    return (
      <div className="bg-[#0a2e4a]/90 text-white text-xs py-2 px-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
        <span className="text-white/50 animate-pulse">Loading Siesta Key weather…</span>
      </div>
    );
  }

  if (isError || !weather) return null;

  const uv = uvLabel(weather.uvIndex);

  return (
    <div className="bg-[#0a2e4a]/95 text-white border-b border-white/10 select-none">
      {/* Compact bar */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-6 px-4 py-2 hover:bg-white/5 transition-colors relative"
        aria-expanded={expanded}
        aria-label="Toggle weather forecast"
      >
        <div className="flex items-center gap-3 flex-wrap text-sm">
          {/* Location */}
          <span className="flex items-center gap-1 text-teal-300 font-medium text-xs uppercase tracking-wide">
            <MapPin className="w-3 h-3" />
            Siesta Key, FL
          </span>

          {/* Current temp + icon */}
          <span className="flex items-center gap-1.5 font-semibold text-base">
            <span className="text-lg leading-none">{wmoIcon(weather.weatherCode)}</span>
            {weather.tempF}°F
          </span>

          {/* Condition */}
          <span className="text-white/70 hidden sm:inline">{weather.condition}</span>

          {/* Feels like */}
          <span className="text-white/60 text-xs hidden md:inline">
            Feels like {weather.feelsLikeF}°F
          </span>

          {/* Wind */}
          <span className="flex items-center gap-1 text-white/70 text-xs">
            <Wind className="w-3 h-3" />
            {weather.windMph} mph
          </span>

          {/* Humidity */}
          <span className="flex items-center gap-1 text-white/70 text-xs hidden sm:flex">
            <Droplets className="w-3 h-3" />
            {weather.humidity}%
          </span>

          {/* UV Index */}
          <span className={`flex items-center gap-1 text-xs hidden md:flex ${uv.color.replace("text-", "text-")}`}>
            <Sun className="w-3 h-3 text-yellow-400" />
            UV {weather.uvIndex} — <span className={uv.color}>{uv.label}</span>
          </span>
        </div>

        {/* Expand toggle — pinned to the right so it doesn't offset the centered content */}
        <div className="absolute right-4 flex items-center gap-1 text-white/40 text-xs">
          <span className="hidden sm:inline">5-day forecast</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded 5-day forecast */}
      {expanded && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weather.forecast.map((day, i) => (
              <div
                key={day.date}
                className="flex flex-col items-center gap-1 min-w-[64px] bg-white/5 rounded-xl px-3 py-2 text-center"
              >
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">
                  {i === 0 ? "Today" : shortDay(day.date)}
                </span>
                <span className="text-xl leading-none">{wmoIcon(day.weatherCode)}</span>
                <span className="text-xs text-white/60">{day.condition}</span>
                <div className="flex gap-1 text-xs font-medium mt-0.5">
                  <span className="text-white">{day.highF}°</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/50">{day.lowF}°</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-2 text-right">
            Source: Open-Meteo · Updated every 30 min
          </p>
        </div>
      )}
    </div>
  );
}
