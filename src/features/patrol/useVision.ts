import { useEffect, useRef, useState } from "react";
import {
  createVisionWorker,
  type VisionRequest,
  type VisionResponse,
} from "../../ml/vision";
import type { VisionHit } from "../../types";

export function useVision() {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState("CLIP stays on-device. First load ~53 MB.");
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<((hits: VisionHit[]) => void) | null>(null);
  const pendingErr = useRef<((err: Error) => void) | null>(null);
  const lastMs = useRef(0);

  useEffect(() => {
    const worker = createVisionWorker();
    workerRef.current = worker;
    const onMsg = (event: MessageEvent<VisionResponse>) => {
      const msg = event.data;
      switch (msg.type) {
        case "progress":
          setProgress(msg.message);
          break;
        case "ready":
          setReady(true);
          setProgress(msg.ms ? `CLIP ready in ${msg.ms} ms` : "CLIP ready");
          break;
        case "result":
          lastMs.current = msg.ms;
          pending.current?.(msg.top3);
          pending.current = null;
          pendingErr.current = null;
          break;
        case "error":
          setError(msg.message);
          pendingErr.current?.(new Error(msg.message));
          pending.current = null;
          pendingErr.current = null;
          break;
        default: {
          const _never: never = msg;
          void _never;
        }
      }
    };
    worker.addEventListener("message", onMsg);
    worker.postMessage({ type: "load" } satisfies VisionRequest);
    return () => {
      worker.removeEventListener("message", onMsg);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  function classify(image: string): Promise<{ top3: VisionHit[]; ms: number }> {
    const worker = workerRef.current;
    if (!worker) return Promise.reject(new Error("vision worker gone"));
    return new Promise((resolve, reject) => {
      pending.current = (top3) => resolve({ top3, ms: lastMs.current });
      pendingErr.current = reject;
      worker.postMessage({ type: "classify", image } satisfies VisionRequest);
    });
  }

  return { ready, progress, error, classify };
}
