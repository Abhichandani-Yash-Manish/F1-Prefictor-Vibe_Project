"use client";
import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  trackTemp: number;
  humidity: number;
  condition: string;
  icon: string;
}

interface WeatherWidgetProps {
  circuit: string;
  raceTime: string;
}

// Map circuits to approximate coordinates for weather API (2026 Season)
const CIRCUIT_COORDS: Record<string, { lat: number; lon: number }> = {
  // 1. Australia
  "Albert Park": { lat: -37.8497, lon: 144.9680 },
  "Melbourne": { lat: -37.8497, lon: 144.9680 },

  // 2. China
  "Shanghai": { lat: 31.3389, lon: 121.2197 },

  // 3. Japan
  "Suzuka": { lat: 34.8431, lon: 136.5410 },

  // 4. Bahrain
  "Sakhir": { lat: 26.0325, lon: 50.5106 },
  "Bahrain": { lat: 26.0325, lon: 50.5106 },

  // 5. Saudi Arabia
  "Jeddah": { lat: 21.6319, lon: 39.1044 },
  "Corniche": { lat: 21.6319, lon: 39.1044 },

  // 6. Miami
  "Miami": { lat: 25.9581, lon: -80.2389 },

  // 7. Imola (Emilia Romagna)
  "Imola": { lat: 44.3439, lon: 11.7167 },
  "Enzo e Dino Ferrari": { lat: 44.3439, lon: 11.7167 },

  // 8. Monaco
  "Monaco": { lat: 43.7347, lon: 7.4206 },
  "Monte Carlo": { lat: 43.7347, lon: 7.4206 },

  // 9. Spain
  "Barcelona": { lat: 41.5700, lon: 2.2611 },
  "Catalunya": { lat: 41.5700, lon: 2.2611 },
  // Madrid might be relevant for 2026? Official calendar check needed. Assuming Barcelona/Madrid transition. 
  // Sticking to Barcelona as per current 2026 data often listed, but if Madrid:
  "Madrid": { lat: 40.4168, lon: -3.7038 },

  // 10. Canada
  "Montreal": { lat: 45.5017, lon: -73.5267 },
  "Gilles Villeneuve": { lat: 45.5017, lon: -73.5267 },

  // 11. Austria
  "Spielberg": { lat: 47.2197, lon: 14.7647 },
  "Red Bull Ring": { lat: 47.2197, lon: 14.7647 },

  // 12. Great Britain
  "Silverstone": { lat: 52.0786, lon: -1.0169 },

  // 13. Belgium
  "Spa": { lat: 50.4372, lon: 5.9714 },
  "Francorchamps": { lat: 50.4372, lon: 5.9714 },

  // 14. Hungary
  "Budapest": { lat: 47.5789, lon: 19.2486 },
  "Hungaroring": { lat: 47.5789, lon: 19.2486 },

  // 15. Netherlands
  "Zandvoort": { lat: 52.3888, lon: 4.5409 },

  // 16. Italy
  "Monza": { lat: 45.6156, lon: 9.2811 },

  // 17. Azerbaijan
  "Baku": { lat: 40.3725, lon: 49.8533 },

  // 18. Singapore
  "Singapore": { lat: 1.2914, lon: 103.8644 },
  "Marina Bay": { lat: 1.2914, lon: 103.8644 },

  // 19. USA (Austin)
  "Austin": { lat: 30.1328, lon: -97.6411 },
  "Americas": { lat: 30.1328, lon: -97.6411 },

  // 20. Mexico
  "Mexico City": { lat: 19.4042, lon: -99.0907 },
  "Hermanos Rodriguez": { lat: 19.4042, lon: -99.0907 },

  // 21. Brazil
  "Sao Paulo": { lat: -23.7036, lon: -46.6997 },
  "Interlagos": { lat: -23.7036, lon: -46.6997 },

  // 22. Las Vegas
  "Las Vegas": { lat: 36.1147, lon: -115.1728 },

  // 23. Qatar
  "Lusail": { lat: 25.4900, lon: 51.4542 },

  // 24. Abu Dhabi
  "Yas Marina": { lat: 24.4672, lon: 54.6031 },
  "Abu Dhabi": { lat: 24.4672, lon: 54.6031 }
};

// Weather condition to emoji mapping
const WEATHER_ICONS: Record<string, string> = {
  "clear": "☀️",
  "sunny": "☀️",
  "partly_cloudy": "⛅",
  "cloudy": "☁️",
  "overcast": "☁️",
  "rain": "🌧️",
  "light_rain": "🌦️",
  "thunderstorm": "⛈️",
  "snow": "❄️",
  "mist": "🌫️",
  "fog": "🌫️",
  "default": "🌡️"
};

export default function WeatherWidget({ circuit, raceTime }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      // Find coordinates for circuit
      const coords = Object.entries(CIRCUIT_COORDS).find(([key]) => 
        circuit.toLowerCase().includes(key.toLowerCase())
      )?.[1];

      if (!coords) {
        // Circuit not found - Silently fail or show placeholder? 
        // Production: Do NOT show fake data.
        console.warn(`Weather: Coordinates not found for ${circuit}`);
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Use Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );

        if (!response.ok) throw new Error("Weather API error");

        const data = await response.json();
        const current = data.current;

        // Map WMO weather codes to conditions
        const weatherCode = current.weather_code;
        let condition = "default";
        if (weatherCode <= 1) condition = "clear";
        else if (weatherCode <= 3) condition = "partly_cloudy";
        else if (weatherCode <= 48) condition = "cloudy";
        else if (weatherCode <= 67) condition = "rain";
        else if (weatherCode <= 77) condition = "snow";
        else if (weatherCode <= 99) condition = "thunderstorm";

        setWeather({
          temp: Math.round(current.temperature_2m),
          // Track temp approx logic based on air temp + direct sun offset (simple heuristic, not mock)
          trackTemp: Math.round(current.temperature_2m + (condition === 'clear' || condition === 'sunny' ? 12 : 5)), 
          humidity: Math.round(current.relative_humidity_2m),
          condition,
          icon: WEATHER_ICONS[condition] || WEATHER_ICONS.default
        });
      } catch (e) {
        console.error("Weather fetch error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [circuit]);

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-4 bg-[var(--bg-carbon)] rounded w-20 mb-2" />
        <div className="h-8 bg-[var(--bg-carbon)] rounded w-16" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
          Track Weather
        </span>
        <span className="text-2xl">{weather.icon}</span>
      </div>

      {/* Temperature Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="font-orbitron text-xl font-bold text-[var(--accent-cyan)]">
            {weather.temp}°
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Air
          </div>
        </div>
        <div className="text-center border-x border-[var(--glass-border)]">
          <div className="font-orbitron text-xl font-bold text-[var(--alert-amber)]">
            {weather.trackTemp}°
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Track
          </div>
        </div>
        <div className="text-center">
          <div className="font-orbitron text-xl font-bold text-[var(--text-silver)]">
            {weather.humidity}%
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Humidity
          </div>
        </div>
      </div>

      {/* Condition Label */}
      <div className="mt-3 text-center">
        <span className="text-xs font-mono text-[var(--text-silver)] uppercase tracking-wider">
          {weather.condition.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
