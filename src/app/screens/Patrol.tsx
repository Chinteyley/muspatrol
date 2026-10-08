import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import copy from "../../i18n/copy.json";
import { SAMPLES } from "../../lib/samples";
import { newId } from "../../lib/time";
import { useVision } from "../../features/patrol/useVision";
import { decideOrder, actionLabel, labelName } from "../../rules/rules";
import { usePatrol } from "../patrol-context";
import type { LabelId, PatrolItem, VisionHit } from "../../types";

type Step = "capture" | "pick" | "water" | "order";

export function Patrol() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const judge = params.get("judge") === "1";
  const { session, addItem, tickScreen } = usePatrol();
  const vision = useVision();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [top3, setTop3] = useState<VisionHit[]>([]);
  const [picked, setPicked] = useState<LabelId | null>(null);
  const [water, setWater] = useState<boolean | null>(null);
  const [visionMs, setVisionMs] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<"camera" | "sample">("camera");
  const [sampleId, setSampleId] = useState<string>();
  const [err, setErr] = useState<string | null>(null);

  const order = useMemo(() => {
    if (!picked || water === null) return null;
    return decideOrder(picked, water);
  }, [picked, water]);

  async function classifyUrl(url: string, from: "camera" | "sample", sid?: string) {
    setBusy(true);
    setErr(null);
    setPreview(url);
    setSource(from);
    setSampleId(sid);
    setWater(null);
    try {
      const result = await vision.classify(url);
      setTop3(result.top3);
      setPicked(result.top3[0]?.id ?? null);
      setVisionMs(result.ms);
      setStep("pick");
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    await classifyUrl(url, "camera");
  }

  function confirmWater(hasWater: boolean) {
    setWater(hasWater);
    setStep("order");
  }

  function commit() {
    if (!picked || water === null || !order) return;
    const item: PatrolItem = {
      id: newId(),
      labelId: picked,
      water,
      actions: order.actions,
      confirmedAt: Date.now(),
      visionMs,
      top3,
      source,
      sampleId,
    };
    addItem(item);
    tickScreen();
    setStep("capture");
    setPreview(null);
    setTop3([]);
    setPicked(null);
    setWater(null);
  }

  return (
    <>
      <section className="card">
        <p className="badge">
          screen-on {Math.round(session.screenOnMs / 1000)}s · {session.items.length} logged
        </p>
        <h1>{judge ? copy.ui.judgeMode.en : copy.ui.snap.en}</h1>
        <p className="muted">{vision.progress}</p>
        {err ? <p>{err}</p> : null}
        {vision.error ? <p>{vision.error}</p> : null}
      </section>

      {step === "capture" && !judge && (
        <section className="card">
          <input
            ref={fileRef}
            className="hidden-file"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <button
            className="btn"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "Naming the pot…" : "Open camera / library"}
          </button>
          <p className="muted">Photos stay on this phone. Nothing is uploaded.</p>
        </section>
      )}

      {step === "capture" && judge && (
        <section className="card">
          <p>Wikimedia Commons photos. Tap one. Desktop judges: this is the whole loop.</p>
          <div className="sample-grid">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                disabled={busy}
                onClick={() => void classifyUrl(sample.file, "sample", sample.id)}
              >
                <img src={sample.file} alt={sample.title} />
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {preview && step !== "capture" && (
        <img className="preview" src={preview} alt="Current container" />
      )}

      {step === "pick" && (
        <section className="card">
          <h2>{copy.ui.pickTop.en}</h2>
          <p className="muted km">{copy.ui.pickTop.km}</p>
          <div style={{ display: "grid", gap: 8 }}>
            {top3.map((hit) => {
              const name = labelName(hit.id);
              return (
                <button
                  key={hit.id}
                  className={picked === hit.id ? "choice active" : "choice"}
                  onClick={() => setPicked(hit.id)}
                >
                  <span>
                    <b>{name.en}</b>
                    <div className="muted km">{name.km}</div>
                  </span>
                  <span className="badge">{hit.score.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
          <div style={{ height: 10 }} />
          <button className="btn" disabled={!picked} onClick={() => setStep("water")}>
            That one
          </button>
        </section>
      )}

      {step === "water" && (
        <section className="card">
          <h2>{copy.ui.waterQ.en}</h2>
          <p className="muted km">{copy.ui.waterQ.km}</p>
          <div className="row">
            <button className="btn" onClick={() => confirmWater(true)}>
              {copy.ui.waterYes.en}
            </button>
            <button className="btn secondary" onClick={() => confirmWater(false)}>
              {copy.ui.waterNo.en}
            </button>
          </div>
        </section>
      )}

      {step === "order" && order && picked && (
        <section className="card order">
          <p className="muted">{labelName(picked).en}</p>
          <div className="order-word">
            {order.actions.map((a) => actionLabel(a).en).join(" + ")}
          </div>
          <p className="km">
            {order.actions.map((a) => actionLabel(a).km).join(" · ")}
          </p>
          <p>{order.en}</p>
          <p className="muted km">{order.km}</p>
          <button className="btn" onClick={commit}>
            {copy.ui.done.en} · {copy.ui.done.km}
          </button>
        </section>
      )}

      <section className="card">
        <button
          className="btn ghost"
          onClick={() => nav("/report")}
          disabled={session.items.length === 0}
        >
          {copy.ui.finish.en} ({session.items.length})
        </button>
      </section>
    </>
  );
}
