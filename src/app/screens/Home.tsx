import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import copy from "../../i18n/copy.json";
import { loadStreak } from "../../lib/db";
import { formatHorizon, usePatrolWindow } from "../../features/weather/usePatrolWindow";

export function Home() {
  const nav = useNavigate();
  const { snap, copy: weather } = usePatrolWindow();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    void loadStreak().then((s) => setStreak(s.days));
  }, []);

  return (
    <>
      <section className="card">
        <p className="muted">{copy.ui.tagline.en}</p>
        <h1 className="hero-title">
          Rain stops.
          <br />
          Tip the pots.
        </h1>
        <p>
          A 10-minute walk after a Phnom Penh downpour. CLIP names the container.
          Code decides TIP / SCRUB / COVER / TOSS. Gemma only writes the report.
        </p>
        <button className="btn" onClick={() => nav("/patrol")}>
          {copy.ui.startPatrol.en}
          <div className="muted km">{copy.ui.startPatrol.km}</div>
        </button>
        <div style={{ height: 10 }} />
        <button className="btn secondary" onClick={() => nav("/patrol?judge=1")}>
          {copy.ui.judgeMode.en}
          <div className="muted km">{copy.ui.judgeMode.km}</div>
        </button>
      </section>

      <section className="card">
        <p className="badge">Open-Meteo · {snap?.place ?? "Phnom Penh"}</p>
        <h2>{weather.title}</h2>
        <p className="muted">{weather.body}</p>
        <div className="stat-row">
          <div className="stat">
            <span className="muted">Rain / 3h</span>
            <b>{snap ? `${snap.rainLast3hMm} mm` : "—"}</b>
          </div>
          <div className="stat">
            <span className="muted">To sunset</span>
            <b>
              {snap?.minutesToSunset != null
                ? formatHorizon(snap.minutesToSunset)
                : "—"}
            </b>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="stat-row">
          <div className="stat">
            <span className="muted">Streak</span>
            <b>{streak}d</b>
          </div>
          <div className="stat">
            <span className="muted">Models</span>
            <b>
              <Link to="/about">53 MB CLIP</Link>
            </b>
          </div>
        </div>
      </section>
    </>
  );
}
