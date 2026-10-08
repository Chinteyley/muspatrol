import { SAMPLES } from "../../lib/samples";
import { CLIP_VISION_MB } from "../../ml/vision";
import { GEMMA4_SIZE_GB } from "../../ml/llm";

export function About() {
  return (
    <>
      <section className="card">
        <h1>Why this is open</h1>
        <p>
          The photos are of a yard, a neighbour&apos;s tire, a spirit house. They
          never leave the phone. Storms kill the 4G exactly when the patrol
          starts. A sangkat volunteer should not need an API key in an outbreak
          year.
        </p>
        <p>
          CLIP names the thing. A TypeScript table decides TIP / SCRUB / COVER /
          TOSS / CHANGE / REPORT. Gemma 4 E2B (Apache-2.0) is allowed to write
          four cheeky lines — and only after a validator checks the log.
        </p>
      </section>

      <section className="card">
        <h2>Models</h2>
        <ul>
          <li>
            CLIP ViT-B/32 vision tower via transformers.js, dtype q4f16, about{" "}
            {CLIP_VISION_MB} MB. Text embeddings are precomputed at build time.
          </li>
          <li>
            Gemma 4 E2B web task via MediaPipe LLM Inference, about {GEMMA4_SIZE_GB}{" "}
            GB, WebGPU only. Template fallback when it is not there.
          </li>
        </ul>
        <p className="muted">
          Not medical advice. Follow the Ministry of Health / WHO dengue guidance:
          tip, toss, cover, scrub after every rain.
        </p>
      </section>

      <section className="card">
        <h2>Sample photo credits</h2>
        <p className="muted">
          Judge-mode photos are Wikimedia Commons files. None were AI-generated.
          None were taken outdoors for this build — nobody on this machine can
          walk a Phnom Penh street.
        </p>
        <ul className="credits">
          {SAMPLES.map((s) => (
            <li key={s.id}>
              <b>{s.title}</b> — {s.author}, {s.license}.{" "}
              <a href={s.sourceUrl} target="_blank" rel="noreferrer">
                source
              </a>
              {" · "}
              <a href={s.licenseUrl} target="_blank" rel="noreferrer">
                license
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
