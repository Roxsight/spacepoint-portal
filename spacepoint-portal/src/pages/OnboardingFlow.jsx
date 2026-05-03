import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ─── Steps config ─────────────────────────────────────────────────────────────
const ROLES = ["Instructor", "Ambassador", "Intern"];

const ROLE_DESCRIPTIONS = {
  Instructor: "Lead sessions, mentor cohorts, shape the curriculum.",
  Ambassador: "Represent SpacePoint globally, build the network.",
  Intern:     "Work on operations, tools, and research directly.",
};

// Word cycling per step for the animated subtitle
const STEP_WORDS = {
  0: ["define", "begin", "launch"],
  1: ["teach", "mentor", "guide"],
  2: ["connect", "represent", "grow"],
  3: ["build", "operate", "ship"],
};

const STEPS = [
  {
    num: "01",
    title: "Who are you?",
    subtitle: "Let's {word} your journey here.",
    field: "name",
  },
  {
    num: "02",
    title: "Choose your track.",
    subtitle: "You'll {word} at the frontier.",
    field: "role",
  },
  {
    num: "03",
    title: "Where are you based?",
    subtitle: "We {word} globally.",
    field: "location",
  },
  {
    num: "04",
    title: "What's your background?",
    subtitle: "We {word} from experience.",
    field: "bio",
  },
];

// ─── Cycling word hook ─────────────────────────────────────────────────────────
function useCyclingWord(words, interval = 2200) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!words?.length) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % words.length); setVisible(true); }, 320);
    }, interval);
    return () => clearInterval(id);
  }, [words, interval]);
  return { word: words?.[idx] ?? "", visible };
}

// ─── Orbital SVG bg ──────────────────────────────────────────────────────────
function OrbitalBg({ step }) {
  return (
    <svg
      viewBox="0 0 600 600"
      style={{
        position: "absolute", width: "80vmin", height: "80vmin",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0.06, pointerEvents: "none", zIndex: 0,
        transition: "opacity 0.8s",
      }}
    >
      <circle cx="300" cy="300" r="80"  stroke="#00E5FF" strokeWidth="0.8" fill="none" />
      <circle cx="300" cy="300" r="160" stroke="#00E5FF" strokeWidth="0.5" fill="none" strokeDasharray="4 8" />
      <circle cx="300" cy="300" r="240" stroke="#00E5FF" strokeWidth="0.4" fill="none" strokeDasharray="2 12" />
      <circle cx="300" cy="300" r="290" stroke="#00E5FF" strokeWidth="0.3" fill="none" />
      {/* Dot on orbit ring based on step */}
      <circle
        cx={300 + 160 * Math.cos((step / STEPS.length) * Math.PI * 2 - Math.PI / 2)}
        cy={300 + 160 * Math.sin((step / STEPS.length) * Math.PI * 2 - Math.PI / 2)}
        r="5" fill="#00E5FF" opacity="0.8"
        style={{ transition: "cx 0.6s ease, cy 0.6s ease" }}
      />
    </svg>
  );
}

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1=forward -1=back
  const [animating, setAnimating] = useState(false);
  const [data, setData] = useState({ name: "", role: "", location: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  const current = STEPS[step];
  const { word, visible: wordVisible } = useCyclingWord(STEP_WORDS[step]);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [step]);

  const goTo = (next) => {
    if (animating) return;
    const dir = next > step ? 1 : -1;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 360);
  };

  const advance = () => {
    setError("");
    const val = data[current.field];
    if (!val?.trim()) { setError("This field is required."); return; }
    if (step < STEPS.length - 1) { goTo(step + 1); }
    else { handleFinish(); }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: data.name,
        role: data.role.toLowerCase(),
        location: data.location,
        bio: data.bio,
        onboarded: true,
      });
      if (err) throw err;
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // Build animated subtitle
  const subtitleParts = current.subtitle.split("{word}");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#04040A",
      color: "#E8E8F0",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.10);
          color: #E8E8F0;
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 700;
          letter-spacing: -0.02em;
          padding: 16px 0;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ob-input::placeholder { color: rgba(255,255,255,0.12); }
        .ob-input:focus {
          border-color: #00E5FF;
          box-shadow: 0 1px 0 0 rgba(0,229,255,0.25);
        }

        .ob-textarea {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #E8E8F0;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 300;
          line-height: 1.7;
          padding: 16px;
          width: 100%;
          outline: none;
          resize: none;
          min-height: 120px;
          transition: border-color 0.2s;
        }
        .ob-textarea:focus { border-color: #00E5FF; }
        .ob-textarea::placeholder { color: rgba(255,255,255,0.15); }

        .role-card {
          border: 1px solid rgba(255,255,255,0.08);
          padding: 20px 24px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
        }
        .role-card:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.02);
        }
        .role-card.selected {
          border-color: #00E5FF;
          background: rgba(0,229,255,0.05);
        }

        .step-slide {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 0.32s ease, transform 0.32s ease;
        }
        .step-slide.exit-forward  { opacity: 0; transform: translateX(-40px); }
        .step-slide.exit-backward { opacity: 0; transform: translateX( 40px); }

        .btn-next {
          background: #00E5FF;
          color: #04040A;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 16px 40px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-next:hover { background: #fff; transform: translateY(-1px); }
        .btn-next:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-back {
          background: transparent;
          color: #444460;
          border: 1px solid rgba(255,255,255,0.08);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 16px 32px;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-back:hover { color: #E8E8F0; border-color: rgba(255,255,255,0.2); }

        .word-anim {
          display: inline-block;
          color: #00E5FF;
          font-style: italic;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .word-anim.hidden { opacity: 0; transform: translateY(8px); }
        .word-anim.shown  { opacity: 1; transform: translateY(0); }

        .progress-bar-fill {
          height: 100%;
          background: #00E5FF;
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
        }

        .grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.018) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none; z-index: 0;
        }
      `}</style>

      <div className="grid-bg" />
      <OrbitalBg step={step} />

      {/* ─── Top bar ─── */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "28px 48px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="3" fill="#00E5FF" />
            <circle cx="11" cy="11" r="7" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.3" fill="none" />
            <circle cx="11" cy="11" r="10.5" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
          </svg>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>SpacePoint</span>
        </div>

        {/* Step counter */}
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          letterSpacing: "0.16em", color: "#333350",
        }}>
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </div>
      </div>

      {/* ─── Progress bar ─── */}
      <div style={{
        position: "relative", zIndex: 10,
        margin: "20px 48px 0",
        height: 1, background: "rgba(255,255,255,0.06)",
      }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* ─── Step dots ─── */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "20px 48px 0",
        display: "flex", gap: 12, alignItems: "center",
      }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: i === step ? 28 : 6,
              height: 6,
              borderRadius: 3,
              background: i < step ? "rgba(0,229,255,0.4)" : i === step ? "#00E5FF" : "rgba(255,255,255,0.1)",
              transition: "all 0.4s ease",
            }} />
            {i < STEPS.length - 1 && (
              <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.06)" }} />
            )}
          </div>
        ))}
      </div>

      {/* ─── Main content ─── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 10, padding: "0 48px",
      }}>
        <div
          className={`step-slide ${animating ? (direction > 0 ? "exit-forward" : "exit-backward") : ""}`}
          style={{ width: "100%", maxWidth: 600 }}
        >
          {/* Step number */}
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            letterSpacing: "0.2em", color: "#00E5FF", marginBottom: 16,
          }}>
            STEP {current.num}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 60px)", letterSpacing: "-0.03em",
            lineHeight: 1.05, marginBottom: 16, color: "#E8E8F0",
          }}>
            {current.title}
          </h1>

          {/* Animated subtitle */}
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 300,
            fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(232,232,240,0.45)",
            marginBottom: 48, lineHeight: 1.6,
          }}>
            {subtitleParts[0]}
            <span className={`word-anim ${wordVisible ? "shown" : "hidden"}`}>{word}</span>
            {subtitleParts[1]}
          </p>

          {/* Field */}
          {current.field === "name" && (
            <input
              ref={inputRef}
              className="ob-input"
              placeholder="Your full name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && advance()}
            />
          )}

          {current.field === "role" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ROLES.map((r) => (
                <div
                  key={r}
                  className={`role-card ${data.role === r ? "selected" : ""}`}
                  onClick={() => setData({ ...data, role: r })}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11,
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        color: data.role === r ? "#00E5FF" : "#E8E8F0",
                        marginBottom: 4, transition: "color 0.2s",
                      }}>
                        {r}
                      </div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 13,
                        fontWeight: 300, color: "rgba(232,232,240,0.4)",
                      }}>
                        {ROLE_DESCRIPTIONS[r]}
                      </div>
                    </div>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      border: `1px solid ${data.role === r ? "#00E5FF" : "rgba(255,255,255,0.15)"}`,
                      background: data.role === r ? "#00E5FF" : "transparent",
                      flexShrink: 0, marginLeft: 20,
                      transition: "all 0.2s",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {current.field === "location" && (
            <input
              ref={inputRef}
              className="ob-input"
              placeholder="City, Country"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && advance()}
            />
          )}

          {current.field === "bio" && (
            <textarea
              ref={inputRef}
              className="ob-textarea"
              placeholder="Tell us about your background, experience, and why you want to join SpacePoint..."
              value={data.bio}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
            />
          )}

          {/* Error */}
          {error && (
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: "0.08em", color: "#FF4D6A", marginTop: 12,
            }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
            {step > 0 && (
              <button className="btn-back" onClick={() => goTo(step - 1)}>
                ← Back
              </button>
            )}
            <button className="btn-next" onClick={advance} disabled={loading}>
              {loading ? "LAUNCHING..." : step === STEPS.length - 1 ? "COMPLETE MISSION →" : "CONTINUE →"}
            </button>
          </div>

          {/* Hint */}
          {current.field !== "role" && current.field !== "bio" && (
            <div style={{
              marginTop: 16, fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.14em", color: "#222240",
            }}>
              PRESS ENTER TO CONTINUE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
