import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import copy from "../../i18n/copy.json";
import { bumpStreak, saveSession } from "../../lib/db";
import { formatDuration } from "../../lib/time";
import { templateReport } from "../../ml/templateReport";
import { gemmaReady, loadGemma4, probeGemmaSupport, writePatrolReport } from "../../ml/llm";
import { actionLabel, labelName } from "../../rules/rules";
import { usePatrol } from "../patrol-context";
import type { LlmStatus, ReportResult } from "../../types";

export function Report() {
  const { session, finish } = usePatrol();
  const [result, setResult] = useState<ReportResult | null>(null);
  const [llm, setLlm] = useState<LlmStatus>({ state: "idle" });
  const [stream, setStream] = useState("");
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    finish();
    const draft = templateReport(session.items, session.screenOnMs);
    setResult(draft);
    void saveSession({ ...session, finishedAt: Date.now() });
    void bumpStreak();
    void probeGemmaSupport().then(setLlm);
  }, [finish, session]);

  async function runGemma() {
    setLlm({ state: "loading", progress: "Starting…" });
    try {
      if (!gemmaReady()) {
        await loadGemma4((progress) => setLlm({ state: "loading", progress }));
      }
      setLlm({ state: "ready" });
      const next = await writePatrolReport(session.items, session.screenOnMs, setStream);
      setResult(next);
    } catch (err) {
      setLlm({
        state: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function share() {
    const text = [result?.report, result?.neighbourNoteEn].filter(Boolean).join("\n\n");
    if (navigator.share) {
      await navigator.share({ title: "MusPatrol", text });
      return;
    }
    await navigator.clipboard.writeText(text);
  }

  return (
    <>
      <section className="card">
        <p className="badge">
          {formatDuration(session.screenOnMs)} screen-on · {session.items.length} logged
        </p>
        <h1>Patrol report</h1>
        <pre className="report">{stream || result?.report}</pre>
        <p className="muted">
          Source: {result?.source ?? "template"}
          {result?.reason ? ` · ${result.reason}` : ""}
        </p>
      </section>

      <section className="card">
        <h2>Tally</h2>
        {session.items.length === 0 ? (
          <p className="muted">No containers yet. The grass still counts.</p>
        ) : (
          <ul>
            {session.items.map((item) => (
              <li key={item.id}>
                <b>{actionLabel(item.actions[0] ?? "NONE").en}</b>{" "}
                {labelName(item.labelId).en}
                {item.water ? " · water" : " · dry"}
                {item.visionMs != null ? ` · ${item.visionMs}ms` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      {result?.neighbourNoteEn ? (
        <section className="card">
          <h2>{copy.ui.neighbour.en}</h2>
          <p>{result.neighbourNoteEn}</p>
          {result.neighbourNoteKm ? <p className="muted">{result.neighbourNoteKm}</p> : null}
        </section>
      ) : null}

      <section className="card">
        <h2>Gemma 4 E2B (optional)</h2>
        <p className="muted">
          Apache-2.0, on-device, ~1.91 GB. Needs WebGPU. The model never decides the
          health action — if it invents a tire, we throw the text away.
        </p>
        {llm.state === "unsupported" || llm.state === "error" ? (
          <p>{llm.reason}</p>
        ) : null}
        {llm.state === "loading" ? <p>{llm.progress}</p> : null}
        <div className="row">
          <button className="btn secondary" onClick={() => void runGemma()}>
            Load Gemma & rewrite
          </button>
          <button className="btn" onClick={() => void share()}>
            Copy / share
          </button>
        </div>
      </section>

      <Link className="btn ghost" to="/" style={{ textAlign: "center" }}>
        Back home
      </Link>
    </>
  );
}
