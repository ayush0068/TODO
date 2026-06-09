import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import toast from "react-hot-toast";

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

  // Content Component (Hero Section)
  const HeroContent = () => (
    <div style={{
      position: "relative", zIndex: 2,
    }}>
      {/* Badge */}
      <div style={{ 
        display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 13px",
        borderRadius: "100px", width: "fit-content", marginBottom: "28px",
        border: `1px solid ${d ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.22)"}`,
        background: d ? "rgba(99,102,241,0.09)" : "rgba(99,102,241,0.07)"
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 7px #6366f1", display: "inline-block", animation: "pls 2s ease-in-out infinite" }} />
        <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#818cf8", letterSpacing: "0.2px" }}>MongoDB Atlas sync enabled</span>
      </div>

      {/* Heading */}
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px", color: d ? "#f1f5f9" : "#0f172a" }}>
        Your tasks,<br />
        <span style={{ background: "linear-gradient(125deg,#6366f1 0%,#0ea5e9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          finally in order.
        </span>
      </h1>

      <p style={{ fontSize: "clamp(13px, 4vw, 14.5px)", lineHeight: 1.78, marginBottom: "36px", color: d ? "#94a3b8" : "#64748b", maxWidth: "100%" }}>
        A clean, fast task manager for developers and teams.
        Create, search, and track — all synced securely to the cloud.
      </p>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
        {features.map(f => (
          <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "13px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: d ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)", border: `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)"}` }}>
              <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: "14px" }} />
            </div>
            <span style={{ fontSize: "clamp(12px, 3.5vw, 13.5px)", color: d ? "#94a3b8" : "#64748b", fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap" }}>
        {["React", "Node.js", "MongoDB", "JWT"].map((t, i, arr) => (
          <span key={t} style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.4px", color: d ? "#334155" : "#94a3b8", paddingRight: i < arr.length - 1 ? "16px" : "0", marginRight: i < arr.length - 1 ? "16px" : "0", borderRight: i < arr.length - 1 ? `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}` : undefined }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans',sans-serif",
      background: d ? "#07070f" : "#f0f0f8",
      overflowX: "hidden",
    }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1rem", height: "56px", flexShrink: 0,
        borderBottom: `1px solid ${d ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.07)"}`,
        background: d ? "rgba(7,7,15,0.9)" : "rgba(240,240,248,0.9)",
        backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", boxShadow: "0 0 18px rgba(99,102,241,0.45)" }}>
            <i className="bi bi-check2-square" style={{ color: "white", fontSize: "15px" }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px", color: d ? "#f1f5f9" : "#0f172a" }}>TaskFlow</span>
        </div>
        
        {/* Theme Toggle Switch */}
        <button 
          onClick={toggleTheme} 
          style={{
            width: "48px",
            height: "26px",
            borderRadius: "100px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 4px",
            background: d ? "#1e293b" : "#e2e8f0",
            transition: "all 0.3s ease",
            position: "relative",
          }}
        >
          <div style={{
            position: "absolute",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "white",
            left: d ? "calc(100% - 24px)" : "2px",
            transition: "left 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}>
            <i className={`bi bi-${d ? "moon" : "sun"}`} style={{ 
              fontSize: "10px", 
              color: d ? "#6366f1" : "#f59e0b",
            }} />
          </div>
          <i className="bi bi-sun" style={{ fontSize: "10px", color: "#f59e0b", opacity: d ? 0.5 : 1, marginLeft: "2px" }} />
          <i className="bi bi-moon" style={{ fontSize: "10px", color: "#6366f1", opacity: d ? 1 : 0.5, marginRight: "2px" }} />
        </button>
      </nav>

      {/* ══ MAIN CONTENT - RESPONSIVE LAYOUT ══ */}
      <div style={{ flex: 1, display: "flex", overflow: "auto" }}>
        
        {/* Desktop Layout (side by side) */}
        <div className="desktop-layout" style={{
          display: "flex",
          width: "100%",
          height: "100%"
        }}>
          
          {/* LEFT HERO PANEL - Will stack on top on mobile */}
          <div className="hero-section" style={{
            flex: "0 0 50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 4rem)",
            position: "relative",
            overflow: "hidden",
            background: d
              ? "linear-gradient(150deg,#090914 0%,#0c0c1e 60%,#07070f 100%)"
              : "linear-gradient(150deg,#eef2ff 0%,#f0f9ff 55%,#f5f3ff 100%)",
            borderRight: `1px solid ${d ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"}`,
          }}>
            {/* Orbs */}
            <div style={{ position: "absolute", top: "-120px", left: "-80px", width: "500px", height: "500px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 65%)" : "radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 65%)" }} />
            <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: "380px", height: "380px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(14,165,233,0.09) 0%,transparent 65%)" : "radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 65%)" }} />
            <HeroContent />
          </div>

          {/* RIGHT FORM PANEL - Will stack on bottom on mobile */}
          <div className="form-section" style={{
            flex: "0 0 50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 3rem)",
            position: "relative",
            overflow: "auto",
            background: d ? "#0d0d1e" : "#ffffff",
          }}>
            {/* Corner glows */}
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)" : "radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 65%)" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-40px", width: "240px", height: "240px", borderRadius: "50%", pointerEvents: "none", background: d ? "radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 65%)" : "radial-gradient(circle,rgba(14,165,233,0.04) 0%,transparent 65%)" }} />

            {/* Top gradient line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#6366f1 30%,#0ea5e9 70%,transparent)" }} />

            <div style={{
              width: "100%",
              maxWidth: "400px",
              position: "relative",
              zIndex: 2,
              transition: "opacity 0.36s,transform 0.36s",
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(10px)" : "translateY(0)"
            }}>
              {mode === "login" ? (
                <div>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "13px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(14,165,233,0.1))", border: `1px solid ${d ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}` }}>
                      <i className="bi bi-person-circle" style={{ color: "#818cf8", fontSize: "20px" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#6366f1", margin: 0 }}>Welcome back</p>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 700, color: d ? "#f1f5f9" : "#0f172a", margin: 0, lineHeight: 1.2 }}>Sign in to continue</h2>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: `linear-gradient(90deg,${d ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)"} 0%,transparent 100%)`, marginBottom: "22px" }} />

                  <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                      <label style={labelSt}>Email address</label>
                      <div style={{ position: "relative" }}>
                        <i className="bi bi-envelope" style={iconSt} />
                        <input
                          type="email"
                          style={inp({}, focusedInput === "lEmail")}
                          placeholder="you@example.com"
                          value={lForm.email}
                          onChange={setL("email")}
                          onFocus={() => setFocusedInput("lEmail")}
                          onBlur={() => setFocusedInput(null)}
                          autoComplete="email"
                        />
                      </div>
                      {errLine(lErr.email)}
                    </div>
                    <div>
                      <label style={labelSt}>Password</label>
                      <div style={{ position: "relative" }}>
                        <i className="bi bi-lock" style={iconSt} />
                        <input
                          type={lShowPw ? "text" : "password"}
                          style={inp({ paddingRight: "2.4rem" }, focusedInput === "lPassword")}
                          placeholder="••••••••"
                          value={lForm.password}
                          onChange={setL("password")}
                          onFocus={() => setFocusedInput("lPassword")}
                          onBlur={() => setFocusedInput(null)}
                          autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setLShowPw(p => !p)} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: d ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.28)", fontSize: "14px" }}>
                          <i className={`bi bi-eye${lShowPw ? "-slash" : ""}`} />
                        </button>
                      </div>
                      {errLine(lErr.password)}
                    </div>
                    <button type="submit" disabled={lLoading} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", marginTop: "4px", background: "linear-gradient(135deg,#6366f1 0%,#0ea5e9 100%)", color: "white", fontSize: "13.5px", fontWeight: 700, cursor: lLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 6px 22px rgba(99,102,241,0.38)", transition: "transform 0.15s,box-shadow 0.15s" }}
                      onMouseEnter={e => { if (!lLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(99,102,241,0.48)"; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(99,102,241,0.38)"; }}>
                      {lLoading
                        ? <span style={{ width: "15px", height: "15px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        : <><i className="bi bi-box-arrow-in-right" style={{ fontSize: "15px" }} />Sign In</>}
                    </button>
                  </form>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" }}>
                    <div style={{ flex: 1, height: "1px", background: d ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)" }} />
                    <span style={{ fontSize: "11px", color: d ? "#334155" : "#94a3b8", fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: "1px", background: d ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)" }} />
                  </div>

                  <button onClick={() => switchTo("register")} disabled={animating} style={{ width: "100%", padding: "12px", borderRadius: "12px", cursor: "pointer", border: `1.5px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13.5px", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: d ? "#64748b" : "#64748b", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.background = d ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.03)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"; e.currentTarget.style.color = d ? "#64748b" : "#64748b"; e.currentTarget.style.background = "transparent"; }}>
                    <i className="bi bi-person-plus" style={{ fontSize: "15px" }} />New user? Create account
                  </button>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
                    <i className="bi bi-shield-check" style={{ color: "#10b981", fontSize: "12px" }} />
                    <span style={{ fontSize: "11px", color: d ? "#334155" : "#94a3b8" }}>Secured with JWT &amp; MongoDB Atlas</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "13px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(14,165,233,0.15),rgba(99,102,241,0.1))", border: `1px solid ${d ? "rgba(14,165,233,0.2)" : "rgba(14,165,233,0.15)"}` }}>
                      <i className="bi bi-rocket-takeoff" style={{ color: "#38bdf8", fontSize: "18px" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#0ea5e9", margin: 0 }}>Get started free</p>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 700, color: d ? "#f1f5f9" : "#0f172a", margin: 0, lineHeight: 1.2 }}>Create your account</h2>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: `linear-gradient(90deg,${d ? "rgba(14,165,233,0.3)" : "rgba(14,165,233,0.2)"} 0%,transparent 100%)`, marginBottom: "20px" }} />

                  <form onSubmit={handleRegister} noValidate style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                    <div>
                      <label style={labelSt}>Full Name</label>
                      <div style={{ position: "relative" }}>
                        <i className="bi bi-person" style={iconSt} />
                        <input
                          type="text"
                          style={inp({}, focusedInput === "rName")}
                          placeholder="John Doe"
                          value={rForm.name}
                          onChange={setR("name")}
                          onFocus={() => setFocusedInput("rName")}
                          onBlur={() => setFocusedInput(null)}
                          autoComplete="name"
                        />
                      </div>
                      {errLine(rErr.name)}
                    </div>
                    <div>
                      <label style={labelSt}>Email address</label>
                      <div style={{ position: "relative" }}>
                        <i className="bi bi-envelope" style={iconSt} />
                        <input
                          type="email"
                          style={inp({}, focusedInput === "rEmail")}
                          placeholder="you@example.com"
                          value={rForm.email}
                          onChange={setR("email")}
                          onFocus={() => setFocusedInput("rEmail")}
                          onBlur={() => setFocusedInput(null)}
                          autoComplete="email"
                        />
                      </div>
                      {errLine(rErr.email)}
                    </div>
                    <div>
                      <label style={labelSt}>Password</label>
                      <div style={{ position: "relative" }}>
                        <i className="bi bi-lock" style={iconSt} />
                        <input
                          type={rShowPw ? "text" : "password"}
                          style={inp({ paddingRight: "2.4rem" }, focusedInput === "rPassword")}
                          placeholder="Min. 6 characters"
                          value={rForm.password}
                          onChange={setR("password")}
                          onFocus={() => setFocusedInput("rPassword")}
                          onBlur={() => setFocusedInput(null)}
                          autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setRShowPw(p => !p)} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: d ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.28)", fontSize: "14px" }}>
                          <i className={`bi bi-eye${rShowPw ? "-slash" : ""}`} />
                        </button>
                      </div>
                      {errLine(rErr.password)}
                      {rForm.password && (
                        <div style={{ marginTop: "7px" }}>
                          <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                            {[1, 2, 3, 4].map(n => (
                              <div key={n} style={{ flex: 1, height: "2.5px", borderRadius: "10px", transition: "background 0.3s", background: pwStr(rForm.password) >= n ? strMeta[pwStr(rForm.password)].color : d ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)" }} />
                            ))}
                          </div>
                          <span style={{ fontSize: "10.5px", fontWeight: 700, color: strMeta[pwStr(rForm.password)].color }}>{strMeta[pwStr(rForm.password)].label}</span>
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={rLoading} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", marginTop: "2px", background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)", color: "white", fontSize: "13.5px", fontWeight: 700, cursor: rLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 6px 22px rgba(14,165,233,0.32)", transition: "transform 0.15s,box-shadow 0.15s" }}
                      onMouseEnter={e => { if (!rLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(14,165,233,0.42)"; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(14,165,233,0.32)"; }}>
                      {rLoading
                        ? <span style={{ width: "15px", height: "15px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        : <><i className="bi bi-rocket-takeoff" style={{ fontSize: "15px" }} />Create Account</>}
                    </button>
                  </form>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
                    <div style={{ flex: 1, height: "1px", background: d ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)" }} />
                    <span style={{ fontSize: "11px", color: d ? "#334155" : "#94a3b8", fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: "1px", background: d ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)" }} />
                  </div>

                  <button onClick={() => switchTo("login")} disabled={animating} style={{ width: "100%", padding: "12px", borderRadius: "12px", cursor: "pointer", border: `1.5px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13.5px", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: d ? "#64748b" : "#64748b", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#0ea5e9"; e.currentTarget.style.background = d ? "rgba(14,165,233,0.05)" : "rgba(14,165,233,0.03)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"; e.currentTarget.style.color = d ? "#64748b" : "#64748b"; e.currentTarget.style.background = "transparent"; }}>
                    <i className="bi bi-arrow-left" style={{ fontSize: "14px" }} />Already have an account? Sign in
                  </button>

                  <p style={{ textAlign: "center", fontSize: "10.5px", color: d ? "#334155" : "#9ca3af", marginTop: "14px", lineHeight: 1.7 }}>
                    By creating an account, you agree to our terms.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pls { 0%,100%{opacity:1;box-shadow:0 0 7px #6366f1} 50%{opacity:0.6;box-shadow:0 0 3px #6366f1} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { opacity: 0.45; }

        /* Mobile Layout - Stack content on top, form below */
        @media (max-width: 768px) {
          .desktop-layout {
            flex-direction: column !important;
          }
          
          .hero-section {
            flex: none !important;
            border-right: none !important;
            border-bottom: 1px solid ${d ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"} !important;
            padding: 2rem 1.5rem !important;
          }
          
          .form-section {
            flex: none !important;
            padding: 2rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}