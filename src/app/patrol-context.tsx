import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { newId } from "../lib/time";
import type { PatrolItem, PatrolSession } from "../types";

type PatrolApi = {
  session: PatrolSession;
  addItem: (item: PatrolItem) => void;
  tickScreen: () => void;
  finish: () => void;
  reset: () => void;
};

const PatrolContext = createContext<PatrolApi | null>(null);

function freshSession(): PatrolSession {
  return {
    id: newId(),
    startedAt: Date.now(),
    screenOnMs: 0,
    items: [],
    locationLabel: "Phnom Penh",
  };
}

export function PatrolProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PatrolSession>(freshSession);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        lastTick.current = Date.now();
        return;
      }
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      setSession((prev) => ({ ...prev, screenOnMs: prev.screenOnMs + delta }));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const api = useMemo<PatrolApi>(
    () => ({
      session,
      addItem: (item) =>
        setSession((prev) => ({ ...prev, items: [...prev.items, item] })),
      tickScreen: () => {
        const now = Date.now();
        const delta = now - lastTick.current;
        lastTick.current = now;
        setSession((prev) => ({ ...prev, screenOnMs: prev.screenOnMs + delta }));
      },
      finish: () => {
        const now = Date.now();
        setSession((prev) => ({
          ...prev,
          finishedAt: now,
          screenOnMs: prev.screenOnMs + (now - lastTick.current),
        }));
        lastTick.current = now;
      },
      reset: () => {
        lastTick.current = Date.now();
        setSession(freshSession());
      },
    }),
    [session],
  );

  return <PatrolContext.Provider value={api}>{children}</PatrolContext.Provider>;
}

export function usePatrol(): PatrolApi {
  const ctx = useContext(PatrolContext);
  if (!ctx) throw new Error("usePatrol outside provider");
  return ctx;
}
