import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import toast from "react-hot-toast";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [animating, setAnimating] = useState(false);

  const [lForm, setLForm] = useState({ email: "", password: "" });
  const [lErr, setLErr] = useState({});
  const [lShowPw, setLShowPw] = useState(false);
  const [lLoading, setLLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const [rForm, setRForm] = useState({ name: "", email: "", password: "" });
  const [rErr, setRErr] = useState({});
  const [rShowPw, setRShowPw] = useState(false);
  const [rLoading, setRLoading] = useState(false);

  const switchTo = (next) => {
    if (animating || mode === next) return;
    setAnimating(true);
    setTimeout(() => { setMode(next); setAnimating(false); }, 360);
  };

  const setL = (k) => (e) => setLForm(p => ({ ...p, [k]: e.target.value }));
  const setR = (k) => (e) => setRForm(p => ({ ...p, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    const err = {};
    if (!lForm.email) err.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(lForm.email)) err.email = "Invalid email";
    if (!lForm.password) err.password = "Required";
    if (Object.keys(err).length) { setLErr(err); return; }
    setLErr({}); setLLoading(true);
    try {
      const res = await authAPI.login(lForm);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      const s = err.response?.status;
      if (s === 404) {
        toast.error("No account found — let's register you.");
        setTimeout(() => { setRForm(p => ({ ...p, email: lForm.email })); switchTo("register"); }, 700);
      } else if (s === 401) {
        setLErr({ password: "Incorrect password." });
      } else {
        toast.error("Server error. Try again.");
      }
    } finally { setLLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = {};
    if (!rForm.name.trim()) err.name = "Required";
    if (!rForm.email) err.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(rForm.email)) err.email = "Invalid email";
    if (!rForm.password) err.password = "Required";
    else if (rForm.password.length < 6) err.password = "Min 6 chars";
    if (Object.keys(err).length) { setRErr(err); return; }
    setRErr({}); setRLoading(true);
    try {
      const res = await authAPI.register(rForm);
      login(res.data.user, res.data.token);
      toast.success("Account created! Welcome.");
      navigate("/dashboard");
    } catch (err) {
      const s = err.response?.status;
      if (s === 409) { setRErr({ email: "Already registered." }); setTimeout(() => switchTo("login"), 1200); }
      else toast.error("Server error. Try again.");
    } finally { setRLoading(false); }
  };

  const pwStr = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };
  const strMeta = [
    { label: "", color: "#334155" },
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#84cc16" },
    { label: "Strong", color: "#10b981" },
  ];

  const isDark = theme === "dark";
  const d = isDark;

  const inp = (extra = {}, isFocused = false) => ({
    width: "100%", boxSizing: "border-box",
    padding: "0.72rem 0.9rem 0.72rem 2.5rem",
    borderRadius: "11px", border: "1.5px solid",
    borderColor: isFocused ? "#6366f1" : (d ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.12)"),
    background: isFocused ? (d ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.02)") : (d ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.025)"),
    color: d ? "#e2e8f0" : "#0f172a",
    fontSize: "13.5px", fontFamily: "'DM Sans',sans-serif",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: isFocused ? "0 0 0 3.5px rgba(99,102,241,0.13)" : "none",
    ...extra,
  });

  const iconSt = {
    position: "absolute", left: "0.8rem", top: "50%",
    transform: "translateY(-50%)", pointerEvents: "none",
    color: d ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.28)", fontSize: "14px",
  };

  const errLine = (msg) => msg ? (
    <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", color: "#ef4444", marginTop: "5px" }}>
      <i className="bi bi-exclamation-circle" style={{ fontSize: "11px" }} />{msg}
    </p>
  ) : null;

  const labelSt = {
    display: "block", fontSize: "11px", fontWeight: 700,
    letterSpacing: "0.7px", textTransform: "uppercase",
    color: d ? "#475569" : "#94a3b8", marginBottom: "6px",
  };

  const features = [
    { icon: "bi-shield-lock-fill", color: "#818cf8", text: "JWT auth — your data stays private" },
    { icon: "bi-search",           color: "#38bdf8", text: "Instant search across all tasks"    },
    { icon: "bi-bar-chart-fill",   color: "#34d399", text: "Visual progress tracking built in"  },
    { icon: "bi-bell-fill",        color: "#fb923c", text: "Due-date alerts & overdue tracking"  },
  ];

  const sharedProps = { inp, iconSt, errLine, labelSt, isDark, focusedInput, setFocusedInput, switchTo, animating };

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'DM Sans',sans-serif",
      background: d ? "#07070f" : "#f0f0f8",
      overflowX: "hidden",
    }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "60px", flexShrink: 0,
        borderBottom: `1px solid ${d ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.07)"}`,
        background: d ? "rgba(7,7,15,0.92)" : "rgba(240,240,248,0.92)",
        backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}>
            <i className="bi bi-check2-square" style={{ color: "white", fontSize: "16px" }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "19px", letterSpacing: "-0.3px", color: d ? "#f1f5f9" : "#0f172a" }}>TaskFlow</span>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={{ width: "48px", height: "26px", borderRadius: "100px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", background: d ? "#1e293b" : "#e2e8f0", transition: "all 0.3s ease", position: "relative" }}>
          <div style={{ position: "absolute", width: "22px", height: "22px", borderRadius: "50%", background: "white", left: d ? "calc(100% - 24px)" : "2px", transition: "left 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
            <i className={`bi bi-${d ? "moon" : "sun"}`} style={{ fontSize: "10px", color: d ? "#6366f1" : "#f59e0b" }} />
          </div>
          <i className="bi bi-sun"  style={{ fontSize: "10px", color: "#f59e0b", opacity: d ? 0.5 : 1, marginLeft: "2px" }} />
          <i className="bi bi-moon" style={{ fontSize: "10px", color: "#6366f1", opacity: d ? 1 : 0.5, marginRight: "2px" }} />
        </button>
      </nav>

      {/* ══ MAIN LAYOUT ══ */}
      {/* 
        KEY FIX: No overflow:hidden, no fixed heights here.
        Desktop = flex row (side by side)
        Mobile  = flex column (stacked) via CSS class
        Each panel uses padding + auto height, NOT min-height that forces overflow
      */}
      <div className="main-layout" style={{ flex: 1, display: "flex" }}>

        {/* ── LEFT HERO PANEL ── */}
        <div className="hero-panel" style={{
          flex: "0 0 55%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4rem 5rem",
          position: "relative",
          overflow: "hidden",
          background: d
            ? "linear-gradient(150deg,#090914 0%,#0c0c1e 60%,#07070f 100%)"
            : "linear-gradient(150deg,#eef2ff 0%,#f0f9ff 55%,#f5f3ff 100%)",
          borderRight: `1px solid ${d ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"}`,
        }}>
          {/* Orbs */}
          <div style={{ position: "absolute", top: "-180px", left: "-100px", width: "650px", height: "650px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)" : "radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 65%)" }} />
          <div style={{ position: "absolute", bottom: "-120px", right: "-60px", width: "500px", height: "500px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(14,165,233,0.1) 0%,transparent 65%)" : "radial-gradient(circle,rgba(14,165,233,0.07) 0%,transparent 65%)" }} />
          <div style={{ position: "absolute", top: "40%", right: "5%", width: "280px", height: "280px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 65%)" : "radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 65%)" }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "560px" }}>

            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", marginBottom: "32px", border: `1px solid ${d ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.22)"}`, background: d ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.07)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1", display: "inline-block", animation: "pls 2s ease-in-out infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#818cf8", letterSpacing: "0.2px" }}>MongoDB Atlas sync enabled</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2.4rem, 3.8vw, 3.6rem)", fontWeight: 800, lineHeight: 1.08, marginBottom: "20px", color: d ? "#f1f5f9" : "#0f172a" }}>
              Your tasks,<br />
              <span style={{ background: "linear-gradient(125deg,#6366f1 0%,#0ea5e9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                finally in order.
              </span>
            </h1>

            <p style={{ fontSize: "15.5px", lineHeight: 1.8, marginBottom: "44px", color: d ? "#94a3b8" : "#64748b", maxWidth: "460px" }}>
              A clean, fast task manager for developers and teams.
              Create, search, and track — all synced securely to the cloud.
            </p>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "52px" }}>
              {features.map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "11px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: d ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)", border: `1px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)"}` }}>
                    <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: "15px" }} />
                  </div>
                  <span style={{ fontSize: "14px", color: d ? "#94a3b8" : "#64748b", fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: d ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.07)", marginBottom: "28px" }} />

            {/* Tech stack */}
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0" }}>
              {["React", "Node.js", "MongoDB", "JWT"].map((t, i, arr) => (
                <span key={t} style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: d ? "#334155" : "#94a3b8", paddingRight: i < arr.length - 1 ? "18px" : "0", marginRight: i < arr.length - 1 ? "18px" : "0", borderRight: i < arr.length - 1 ? `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}` : undefined }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="form-panel" style={{
          flex: "0 0 45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 4rem",
          position: "relative",
          overflow: "auto",
          background: d ? "#0d0d1e" : "#ffffff",
        }}>
          {/* Corner glows */}
          <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)" : "radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 65%)" }} />
          <div style={{ position: "absolute", bottom: "-80px", left: "-60px", width: "320px", height: "320px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 65%)" : "radial-gradient(circle,rgba(14,165,233,0.04) 0%,transparent 65%)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#6366f1 30%,#0ea5e9 70%,transparent)" }} />

          <div style={{
            width: "100%",
            maxWidth: "420px",
            position: "relative",
            zIndex: 2,
            transition: "opacity 0.36s, transform 0.36s",
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(10px)" : "translateY(0)",
          }}>
            {mode === "login" ? (
              <LoginForm
                lForm={lForm} setL={setL} lErr={lErr}
                lShowPw={lShowPw} setLShowPw={setLShowPw}
                lLoading={lLoading} handleLogin={handleLogin}
                {...sharedProps}
              />
            ) : (
              <RegisterForm
                rForm={rForm} setR={setR} rErr={rErr}
                rShowPw={rShowPw} setRShowPw={setRShowPw}
                rLoading={rLoading} handleRegister={handleRegister}
                pwStr={pwStr} strMeta={strMeta}
                {...sharedProps}
              />
            )}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pls  { 0%,100%{opacity:1;box-shadow:0 0 8px #6366f1} 50%{opacity:0.6;box-shadow:0 0 3px #6366f1} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { opacity: 0.45; }

        /* ── Tablet ── */
        @media (max-width: 1100px) {
          .hero-panel { padding: 3rem 3.5rem !important; }
          .form-panel { padding: 2.5rem 3rem !important; }
        }

        /* ── Mobile: stack vertically ── */
        @media (max-width: 768px) {
          .main-layout {
            flex-direction: column !important;
          }
          .hero-panel {
            flex: none !important;
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid ${d ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"} !important;
            padding: 2.5rem 1.5rem !important;
            justify-content: flex-start !important;
          }
          .form-panel {
            flex: none !important;
            width: 100% !important;
            padding: 2.5rem 1.5rem !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}