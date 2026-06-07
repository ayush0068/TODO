import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import toast from "react-hot-toast";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [animating, setAnimating] = useState(false);

  const [lForm, setLForm] = useState({ email: "", password: "" });
  const [lErr, setLErr] = useState({});
  const [lShowPw, setLShowPw] = useState(false);
  const [lLoading, setLLoading] = useState(false);

  const [rForm, setRForm] = useState({ name: "", email: "", password: "" });
  const [rErr, setRErr] = useState({});
  const [rShowPw, setRShowPw] = useState(false);
  const [rLoading, setRLoading] = useState(false);

  const switchTo = (next) => {
    if (animating || mode === next) return;
    setAnimating(true);
    setTimeout(() => { setMode(next); setAnimating(false); }, 420);
  };

  const setL = (k) => (e) => setLForm((p) => ({ ...p, [k]: e.target.value }));
  const setR = (k) => (e) => setRForm((p) => ({ ...p, [k]: e.target.value }));

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
        setTimeout(() => { setRForm((p) => ({ ...p, email: lForm.email })); switchTo("register"); }, 700);
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
  const isReg = mode === "register";

  const inp = (extra = {}) => ({
    width: "100%",
    padding: "0.72rem 0.9rem 0.72rem 2.55rem",
    borderRadius: "10px",
    border: "1.5px solid",
    borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.12)",
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.025)",
    color: isDark ? "#e2e8f0" : "#0f172a",
    fontSize: "13.5px",
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    ...extra,
  });

  const onFocus = (e) => {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3.5px rgba(99,102,241,0.13)";
    e.target.style.background = isDark ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.02)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.12)";
    e.target.style.boxShadow = "none";
    e.target.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.025)";
  };

  const iconSt = {
    position: "absolute", left: "0.8rem", top: "50%",
    transform: "translateY(-50%)", pointerEvents: "none",
    color: isDark ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.28)", fontSize: "14px",
  };

  const errLine = (msg) => msg ? (
    <p style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", color: "#ef4444", marginTop: "5px" }}>
      <i className="bi bi-exclamation-circle" style={{ fontSize: "11px" }} />{msg}
    </p>
  ) : null;

  const labelSt = {
    display: "block", fontSize: "11px", fontWeight: 700,
    letterSpacing: "0.7px", textTransform: "uppercase",
    color: isDark ? "#475569" : "#94a3b8", marginBottom: "6px",
  };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex",
      fontFamily: "'DM Sans',sans-serif",
      background: isDark ? "#07070f" : "#f4f4fa",
      overflow: "hidden",
    }}>

      {/* ══════════ LEFT PANEL ══════════ */}
      <div style={{
        flex: "0 0 52%", display: "flex", flexDirection: "column",
        padding: "2.2rem 3.2rem", position: "relative", overflow: "hidden",
        borderRight: `1px solid ${isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.1)"}`,
        background: isDark
          ? "linear-gradient(150deg,#090914 0%,#0c0c1e 60%,#07070f 100%)"
          : "linear-gradient(150deg,#eef2ff 0%,#f0f9ff 55%,#f5f3ff 100%)",
      }}>

        {/* Orbs */}
        <div style={{ position:"absolute",top:"-100px",left:"-60px",width:"400px",height:"400px",borderRadius:"50%",pointerEvents:"none",
          background: isDark ? "radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 68%)" : "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 68%)" }} />
        <div style={{ position:"absolute",bottom:"-60px",right:"20px",width:"340px",height:"340px",borderRadius:"50%",pointerEvents:"none",
          background: isDark ? "radial-gradient(circle,rgba(14,165,233,0.1) 0%,transparent 68%)" : "radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 68%)" }} />
        {/* Noise texture (subtle) */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none",opacity: isDark?0.018:0.03,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize:"180px",
        }} />

        {/* Nav */}
        <nav style={{ position:"relative",zIndex:2,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"auto",paddingBottom:"3rem" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
            <div style={{ width:"36px",height:"36px",borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",
              background:"linear-gradient(135deg,#6366f1,#0ea5e9)",boxShadow:"0 0 22px rgba(99,102,241,0.45)" }}>
              <i className="bi bi-check2-square" style={{ color:"white",fontSize:"17px" }} />
            </div>
            <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:"19px",letterSpacing:"-0.3px",
              color: isDark?"#f1f5f9":"#0f172a" }}>TaskFlow</span>
          </div>
          <button onClick={toggleTheme} style={{ width:"36px",height:"36px",borderRadius:"10px",border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",
            background: isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.06)",
            color: isDark?"#94a3b8":"#475569" }}
            onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.1)":"rgba(15,23,42,0.1)"}
            onMouseLeave={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.06)"}>
            <i className={`bi bi-${isDark?"sun":"moon"}`} style={{ fontSize:"15px" }} />
          </button>
        </nav>

        {/* Hero */}
        <div style={{ position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",justifyContent:"center" }}>

          {/* Live badge */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 13px",borderRadius:"100px",
            width:"fit-content",marginBottom:"26px",
            border:`1px solid ${isDark?"rgba(99,102,241,0.28)":"rgba(99,102,241,0.22)"}`,
            background: isDark?"rgba(99,102,241,0.09)":"rgba(99,102,241,0.07)" }}>
            <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#6366f1",
              boxShadow:"0 0 7px #6366f1",display:"inline-block",
              animation:"pls 2s ease-in-out infinite" }} />
            <span style={{ fontSize:"11.5px",fontWeight:600,color:"#818cf8",letterSpacing:"0.2px" }}>
              MongoDB Atlas sync enabled
            </span>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(2.2rem,3.2vw,3rem)",fontWeight:800,
            lineHeight:1.12,marginBottom:"18px",color: isDark?"#f1f5f9":"#0f172a" }}>
            Your tasks,<br />
            <span style={{ background:"linear-gradient(125deg,#6366f1 0%,#0ea5e9 100%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
              finally in order.
            </span>
          </h1>

          <p style={{ fontSize:"14.5px",lineHeight:1.78,maxWidth:"380px",marginBottom:"38px",
            color: isDark?"#94a3b8":"#64748b" }}>
            A clean, fast task manager for developers and teams.
            Create, search, and track — all synced securely to the cloud.
          </p>

          {/* Stats */}
          <div style={{ display:"flex",gap:"0",marginBottom:"40px" }}>
            {[
              { val:"12k+", lbl:"Tasks done", icon:"bi-check2-all" },
              { val:"3.2k", lbl:"Users", icon:"bi-people" },
              { val:"99.9%", lbl:"Uptime", icon:"bi-activity" },
            ].map((m, i) => (
              <div key={m.val} style={{ paddingRight: i<2?"28px":"0", marginRight: i<2?"28px":"0",
                borderRight: i<2?`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(15,23,42,0.08)"}`:undefined }}>
                <div style={{ display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px" }}>
                  <i className={`bi ${m.icon}`} style={{ color:"#6366f1",fontSize:"13px" }} />
                  <span style={{ fontWeight:800,fontSize:"19px",color: isDark?"#f1f5f9":"#0f172a",fontFamily:"'Playfair Display',serif" }}>{m.val}</span>
                </div>
                <span style={{ fontSize:"10.5px",textTransform:"uppercase",letterSpacing:"0.5px",color: isDark?"#475569":"#94a3b8",fontWeight:600 }}>{m.lbl}</span>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
            {[
              { icon:"bi-shield-lock-fill", color:"#818cf8", text:"JWT auth — your data stays private" },
              { icon:"bi-search", color:"#38bdf8", text:"Instant search across all tasks" },
              { icon:"bi-bar-chart-fill", color:"#34d399", text:"Visual progress tracking built in" },
            ].map((f) => (
              <div key={f.text} style={{ display:"flex",alignItems:"center",gap:"12px" }}>
                <div style={{ width:"32px",height:"32px",borderRadius:"9px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                  background: isDark?"rgba(255,255,255,0.04)":"rgba(15,23,42,0.04)",
                  border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(15,23,42,0.07)"}` }}>
                  <i className={`bi ${f.icon}`} style={{ color:f.color,fontSize:"14px" }} />
                </div>
                <span style={{ fontSize:"13px",color: isDark?"#94a3b8":"#64748b",fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:"relative",zIndex:2,marginTop:"2.5rem",display:"flex",alignItems:"center",gap:"0" }}>
          {["React","Node.js","MongoDB","JWT"].map((t,i) => (
            <span key={t} style={{ fontSize:"10.5px",fontWeight:700,letterSpacing:"0.4px",
              color: isDark?"#334155":"#94a3b8",
              paddingRight: i<3?"16px":"0", marginRight: i<3?"16px":"0",
              borderRight: i<3?`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(15,23,42,0.08)"}`:undefined }}>
              {t}
            </span>
          ))}
        </div>
      </div>



      {/* ══════════ RIGHT PANEL ══════════ */}
      <div style={{ flex:"0 0 48%",display:"flex",alignItems:"center",justifyContent:"center",
        padding:"2rem 3rem",position:"relative",overflow:"hidden",
        background: isDark?"#0d0d1e":"#ffffff" }}>

        {/* Top gradient line */}
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"2px",
          background:"linear-gradient(90deg,transparent 0%,#6366f1 30%,#0ea5e9 70%,transparent 100%)" }} />

        {/* Corner glow */}
        <div style={{ position:"absolute",top:"-80px",right:"-80px",width:"320px",height:"320px",
          borderRadius:"50%",pointerEvents:"none",
          background: isDark?"radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)":"radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute",bottom:"-80px",left:"-40px",width:"260px",height:"260px",
          borderRadius:"50%",pointerEvents:"none",
          background: isDark?"radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 65%)":"radial-gradient(circle,rgba(14,165,233,0.04) 0%,transparent 65%)" }} />

        {/* Form container — stretches on register */}
        <div style={{
          width:"100%", maxWidth:"390px",
          transition:"all 0.42s cubic-bezier(0.4,0,0.2,1)",
          opacity: animating ? 0 : 1,
          transform: animating
            ? (isReg ? "translateY(-10px) scaleY(0.96)" : "translateY(10px) scaleY(0.96)")
            : "translateY(0) scaleY(1)",
        }}>

          {mode === "login" ? (
            /* ───── LOGIN FORM ───── */
            <div>
              {/* Header */}
              <div style={{ marginBottom:"28px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px" }}>
                  <div style={{ width:"40px",height:"40px",borderRadius:"12px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(14,165,233,0.1))",
                    border:`1px solid ${isDark?"rgba(99,102,241,0.2)":"rgba(99,102,241,0.15)"}` }}>
                    <i className="bi bi-person-circle" style={{ color:"#818cf8",fontSize:"20px" }} />
                  </div>
                  <div>
                    <p style={{ fontSize:"10.5px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"#6366f1",margin:0 }}>Welcome back</p>
                    <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"21px",fontWeight:700,
                      color: isDark?"#f1f5f9":"#0f172a",margin:0,lineHeight:1.2 }}>Sign in to continue</h2>
                  </div>
                </div>
                <div style={{ height:"1px",background:`linear-gradient(90deg,${isDark?"rgba(99,102,241,0.3)":"rgba(99,102,241,0.2)"} 0%,transparent 100%)` }} />
              </div>

              <form onSubmit={handleLogin} noValidate style={{ display:"flex",flexDirection:"column",gap:"15px" }}>
                <div>
                  <label style={labelSt}>Email address</label>
                  <div style={{ position:"relative" }}>
                    <i className="bi bi-envelope" style={iconSt} />
                    <input type="email" style={inp()} placeholder="you@example.com"
                      value={lForm.email} onChange={setL("email")} onFocus={onFocus} onBlur={onBlur} autoComplete="email" />
                  </div>
                  {errLine(lErr.email)}
                </div>

                <div>
                  <label style={labelSt}>Password</label>
                  <div style={{ position:"relative" }}>
                    <i className="bi bi-lock" style={iconSt} />
                    <input type={lShowPw?"text":"password"} style={inp({ paddingRight:"2.4rem" })}
                      placeholder="••••••••" value={lForm.password} onChange={setL("password")}
                      onFocus={onFocus} onBlur={onBlur} autoComplete="current-password" />
                    <button type="button" onClick={()=>setLShowPw(p=>!p)} style={{ position:"absolute",right:"11px",top:"50%",
                      transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,
                      color: isDark?"rgba(255,255,255,0.28)":"rgba(15,23,42,0.28)",fontSize:"14px" }}>
                      <i className={`bi bi-eye${lShowPw?"-slash":""}`} />
                    </button>
                  </div>
                  {errLine(lErr.password)}
                </div>

                <button type="submit" disabled={lLoading} style={{
                  width:"100%",padding:"12.5px",borderRadius:"11px",border:"none",marginTop:"4px",
                  background:"linear-gradient(135deg,#6366f1 0%,#0ea5e9 100%)",
                  color:"white",fontSize:"13.5px",fontWeight:700,cursor:lLoading?"not-allowed":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                  fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.2px",
                  boxShadow:"0 6px 20px rgba(99,102,241,0.38)",
                  transition:"transform 0.15s,box-shadow 0.15s",
                }}
                  onMouseEnter={e=>{if(!lLoading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 10px 26px rgba(99,102,241,0.48)";}}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.38)";}}>
                  {lLoading
                    ? <span style={{ width:"15px",height:"15px",borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",display:"inline-block",animation:"spin 0.7s linear infinite" }} />
                    : <><i className="bi bi-box-arrow-in-right" style={{ fontSize:"15px" }} />Sign In</>}
                </button>
              </form>

              <div style={{ display:"flex",alignItems:"center",gap:"10px",margin:"20px 0" }}>
                <div style={{ flex:1,height:"1px",background: isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.07)" }} />
                <span style={{ fontSize:"11px",color: isDark?"#334155":"#94a3b8",fontWeight:600 }}>OR</span>
                <div style={{ flex:1,height:"1px",background: isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.07)" }} />
              </div>

              <button onClick={()=>switchTo("register")} disabled={animating} style={{
                width:"100%",padding:"12px",borderRadius:"11px",cursor:"pointer",
                border:`1.5px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(15,23,42,0.1)"}`,
                background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                fontSize:"13.5px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                color: isDark?"#64748b":"#64748b",transition:"all 0.2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#6366f1";e.currentTarget.style.color="#6366f1";e.currentTarget.style.background=isDark?"rgba(99,102,241,0.05)":"rgba(99,102,241,0.03)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.08)":"rgba(15,23,42,0.1)";e.currentTarget.style.color=isDark?"#64748b":"#64748b";e.currentTarget.style.background="transparent";}}>
                <i className="bi bi-person-plus" style={{ fontSize:"15px" }} />
                New user? Create account
              </button>

              <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",marginTop:"20px" }}>
                <i className="bi bi-shield-check" style={{ color:"#10b981",fontSize:"12px" }} />
                <span style={{ fontSize:"11px",color: isDark?"#334155":"#94a3b8" }}>Secured with JWT &amp; MongoDB Atlas</span>
              </div>
            </div>

          ) : (
            /* ───── REGISTER FORM ───── */
            <div>
              <div style={{ marginBottom:"24px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px" }}>
                  <div style={{ width:"40px",height:"40px",borderRadius:"12px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:"linear-gradient(135deg,rgba(14,165,233,0.15),rgba(99,102,241,0.1))",
                    border:`1px solid ${isDark?"rgba(14,165,233,0.2)":"rgba(14,165,233,0.15)"}` }}>
                    <i className="bi bi-rocket-takeoff" style={{ color:"#38bdf8",fontSize:"18px" }} />
                  </div>
                  <div>
                    <p style={{ fontSize:"10.5px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"#0ea5e9",margin:0 }}>Get started free</p>
                    <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"21px",fontWeight:700,
                      color: isDark?"#f1f5f9":"#0f172a",margin:0,lineHeight:1.2 }}>Create your account</h2>
                  </div>
                </div>
                <div style={{ height:"1px",background:`linear-gradient(90deg,${isDark?"rgba(14,165,233,0.3)":"rgba(14,165,233,0.2)"} 0%,transparent 100%)` }} />
              </div>

              <form onSubmit={handleRegister} noValidate style={{ display:"flex",flexDirection:"column",gap:"13px" }}>
                <div>
                  <label style={labelSt}>Full Name</label>
                  <div style={{ position:"relative" }}>
                    <i className="bi bi-person" style={iconSt} />
                    <input type="text" style={inp()} placeholder="John Doe"
                      value={rForm.name} onChange={setR("name")} onFocus={onFocus} onBlur={onBlur} autoComplete="name" />
                  </div>
                  {errLine(rErr.name)}
                </div>

                <div>
                  <label style={labelSt}>Email address</label>
                  <div style={{ position:"relative" }}>
                    <i className="bi bi-envelope" style={iconSt} />
                    <input type="email" style={inp()} placeholder="you@example.com"
                      value={rForm.email} onChange={setR("email")} onFocus={onFocus} onBlur={onBlur} autoComplete="email" />
                  </div>
                  {errLine(rErr.email)}
                </div>

                <div>
                  <label style={labelSt}>Password</label>
                  <div style={{ position:"relative" }}>
                    <i className="bi bi-lock" style={iconSt} />
                    <input type={rShowPw?"text":"password"} style={inp({ paddingRight:"2.4rem" })}
                      placeholder="Min. 6 characters" value={rForm.password} onChange={setR("password")}
                      onFocus={onFocus} onBlur={onBlur} autoComplete="new-password" />
                    <button type="button" onClick={()=>setRShowPw(p=>!p)} style={{ position:"absolute",right:"11px",top:"50%",
                      transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,
                      color: isDark?"rgba(255,255,255,0.28)":"rgba(15,23,42,0.28)",fontSize:"14px" }}>
                      <i className={`bi bi-eye${rShowPw?"-slash":""}`} />
                    </button>
                  </div>
                  {errLine(rErr.password)}
                  {rForm.password && (
                    <div style={{ marginTop:"7px" }}>
                      <div style={{ display:"flex",gap:"3px",marginBottom:"4px" }}>
                        {[1,2,3,4].map(n=>(
                          <div key={n} style={{ flex:1,height:"2.5px",borderRadius:"10px",transition:"background 0.3s",
                            background: pwStr(rForm.password)>=n ? strMeta[pwStr(rForm.password)].color : isDark?"rgba(255,255,255,0.07)":"rgba(15,23,42,0.08)" }} />
                        ))}
                      </div>
                      <span style={{ fontSize:"10.5px",fontWeight:700,color:strMeta[pwStr(rForm.password)].color }}>
                        {strMeta[pwStr(rForm.password)].label}
                      </span>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={rLoading} style={{
                  width:"100%",padding:"12.5px",borderRadius:"11px",border:"none",marginTop:"4px",
                  background:"linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)",
                  color:"white",fontSize:"13.5px",fontWeight:700,cursor:rLoading?"not-allowed":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                  fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.2px",
                  boxShadow:"0 6px 20px rgba(14,165,233,0.32)",
                  transition:"transform 0.15s,box-shadow 0.15s",
                }}
                  onMouseEnter={e=>{if(!rLoading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 10px 26px rgba(14,165,233,0.42)";}}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 20px rgba(14,165,233,0.32)";}}>
                  {rLoading
                    ? <span style={{ width:"15px",height:"15px",borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",display:"inline-block",animation:"spin 0.7s linear infinite" }} />
                    : <><i className="bi bi-rocket-takeoff" style={{ fontSize:"15px" }} />Create Account</>}
                </button>
              </form>

              <div style={{ display:"flex",alignItems:"center",gap:"10px",margin:"18px 0" }}>
                <div style={{ flex:1,height:"1px",background: isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.07)" }} />
                <span style={{ fontSize:"11px",color: isDark?"#334155":"#94a3b8",fontWeight:600 }}>OR</span>
                <div style={{ flex:1,height:"1px",background: isDark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.07)" }} />
              </div>

              <button onClick={()=>switchTo("login")} disabled={animating} style={{
                width:"100%",padding:"12px",borderRadius:"11px",cursor:"pointer",
                border:`1.5px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(15,23,42,0.1)"}`,
                background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                fontSize:"13.5px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                color: isDark?"#64748b":"#64748b",transition:"all 0.2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#0ea5e9";e.currentTarget.style.color="#0ea5e9";e.currentTarget.style.background=isDark?"rgba(14,165,233,0.05)":"rgba(14,165,233,0.03)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?"rgba(255,255,255,0.08)":"rgba(15,23,42,0.1)";e.currentTarget.style.color=isDark?"#64748b":"#64748b";e.currentTarget.style.background="transparent";}}>
                <i className="bi bi-arrow-left" style={{ fontSize:"14px" }} />
                Already have an account? Sign in
              </button>

              <p style={{ textAlign:"center",fontSize:"10.5px",color: isDark?"#334155":"#9ca3af",marginTop:"16px",lineHeight:1.7 }}>
                By creating an account, you agree to our terms.<br />
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pls { 0%,100%{opacity:1;box-shadow:0 0 7px #6366f1} 50%{opacity:0.6;box-shadow:0 0 3px #6366f1} }
        * { box-sizing: border-box; margin:0; padding:0; }
        input::placeholder { opacity: 0.45; }
        @media (max-width: 860px) {
          div[style*="flex: 0 0 52%"] { display: none !important; }
          div[style*="flex: 0 0 48%"] { flex: 1 !important; padding: 2rem 1.4rem !important; }
        }
      `}</style>
    </div>
  );
}