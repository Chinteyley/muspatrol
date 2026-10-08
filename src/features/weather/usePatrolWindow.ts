import { useEffect, useState } from "react";
import { get, set } from "idb-keyval";
import type { WeatherSnapshot } from "../../types";

const WEATHER_KEY = "muspatrol-weather";
export const PNH = { latitude: 11.5564, longitude: 104.9282, place: "Phnom Penh" };

type OpenMeteo = {
  hourly?: { time: string[]; precipitation?: number[] };
  daily?: { sunset?: string[] };
};

/** Open-Meteo local times have no offset. Phnom Penh is UTC+7. */
export function parseIct(iso: string): number {
  if (/Z|[+-]\d{2}:\d{2}$/.test(iso)) return Date.parse(iso);
  return Date.parse(`${iso}+07:00`);
}

function minutesUntil(iso: string, now = Date.now()): number | null {
  const t = parseIct(iso);
  if (Number.isNaN(t)) return null;
  return Math.round((t - now) / 60000);
}

export function formatHorizon(minutes: number): string {
  if (minutes < 0) return "after sunset";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function rainLast3h(hourly: NonNullable<OpenMeteo["hourly"]>, now = Date.now()): number {
  const times = hourly.time ?? [];
  const precip = hourly.precipitation ?? [];
  let sum = 0;
  for (let i = 0; i < times.length; i++) {
    const t = parseIct(times[i] ?? "");
    if (Number.isNaN(t)) continue;
    const age = now - t;
    if (age >= 0 && age <= 3 * 60 * 60 * 1000) {
      sum += precip[i] ?? 0;
    }
  }
  return Math.round(sum * 10) / 10;
}

export async function fetchPatrolWindow(
  coords: { latitude: number; longitude: number; place: string } = PNH,
): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(coords.latitude));
  url.searchParams.set("longitude", String(coords.longitude));
  url.searchParams.set("hourly", "precipitation");
  url.searchParams.set("daily", "sunset");
  url.searchParams.set("timezone", "Asia/Phnom_Penh");
  url.searchParams.set("past_hours", "3");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as OpenMeteo;
  const sunsetIso = data.daily?.sunset?.[0] ?? "";
  const snap: WeatherSnapshot = {
    fetchedAt: Date.now(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    place: coords.place,
    rainLast3hMm: data.hourly ? rainLast3h(data.hourly) : 0,
    sunsetIso,
    minutesToSunset: sunsetIso ? minutesUntil(sunsetIso) : null,
    stale: false,
  };
  await set(WEATHER_KEY, snap);
  return snap;
}

export function windowCopy(snap: WeatherSnapshot | null): { title: string; body: string } {
  if (!snap) {
    return {
      title: "Patrol window",
      body: "Weather still loading. Morning and late afternoon both work — Aedes is a day biter.",
    };
  }
  const rain = snap.rainLast3hMm;
  const mins = snap.minutesToSunset;
  const stale = snap.stale ? " (cached, offline)" : "";
  if (rain >= 0.5 && mins !== null && mins > 0) {
    return {
      title: `Rain in the last 3h: ${rain} mm${stale}`,
      body: `Window open until sunset (${mins} min). Ten minutes. Flip the pots.`,
    };
  }
  if (rain >= 0.5) {
    return {
      title: `It already rained (${rain} mm / 3h)${stale}`,
      body: "Containers are still full. A morning loop works too.",
    };
  }
  if (mins !== null && mins > 20 && mins < 180) {
    return {
      title: `Sunset in ${mins} min${stale}`,
      body: "Even without a fresh dump, yesterday's saucers still hold water.",
    };
  }
  return {
    title: `${snap.place} is quiet right now${stale}`,
    body: "No fresh rain in the last 3 hours. Patrol anyway if you know a soggy corner.",
  };
}

export function usePatrolWindow() {
  const [snap, setSnap] = useState<WeatherSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const cached = await get<WeatherSnapshot>(WEATHER_KEY);
      if (cached && alive) {
        const age = Date.now() - cached.fetchedAt;
        setSnap({ ...cached, stale: age > 30 * 60 * 1000 });
      }
      try {
        const fresh = await fetchPatrolWindow();
        if (alive) setSnap(fresh);
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : String(err));
          if (cached) setSnap({ ...cached, stale: true });
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { snap, error, copy: windowCopy(snap) };
}
