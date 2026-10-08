import { get, set } from "idb-keyval";
import type { PatrolSession } from "../types";

const STREAK_KEY = "muspatrol-streak";
const LOG_KEY = "muspatrol-log";

export type Streak = {
  days: number;
  lastDate: string | null;
};

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function yesterdayKey(d = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return y.toISOString().slice(0, 10);
}

export async function loadStreak(): Promise<Streak> {
  return (await get<Streak>(STREAK_KEY)) ?? { days: 0, lastDate: null };
}

export async function bumpStreak(now = new Date()): Promise<Streak> {
  const current = await loadStreak();
  const today = todayKey(now);
  if (current.lastDate === today) return current;
  const next: Streak =
    current.lastDate === yesterdayKey(now)
      ? { days: current.days + 1, lastDate: today }
      : { days: 1, lastDate: today };
  await set(STREAK_KEY, next);
  return next;
}

export async function saveSession(session: PatrolSession): Promise<void> {
  const all = (await get<PatrolSession[]>(LOG_KEY)) ?? [];
  all.unshift(session);
  await set(LOG_KEY, all.slice(0, 40));
}

export async function loadSessions(): Promise<PatrolSession[]> {
  return (await get<PatrolSession[]>(LOG_KEY)) ?? [];
}
