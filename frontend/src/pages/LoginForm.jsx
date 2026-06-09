export default function LoginForm({
  lForm, setL, lErr, lShowPw, setLShowPw, lLoading,
  handleLogin, switchTo, animating,
  focusedInput, setFocusedInput,
  inp, iconSt, errLine, labelSt, isDark,
}) {
  const d = isDark;

  return (
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
        <button
          type="submit"
          disabled={lLoading}
          style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", marginTop: "4px", background: "linear-gradient(135deg,#6366f1 0%,#0ea5e9 100%)", color: "white", fontSize: "13.5px", fontWeight: 700, cursor: lLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 6px 22px rgba(99,102,241,0.38)", transition: "transform 0.15s,box-shadow 0.15s" }}
          onMouseEnter={e => { if (!lLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(99,102,241,0.48)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(99,102,241,0.38)"; }}
        >
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

      <button
        onClick={() => switchTo("register")}
        disabled={animating}
        style={{ width: "100%", padding: "12px", borderRadius: "12px", cursor: "pointer", border: `1.5px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13.5px", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: d ? "#64748b" : "#64748b", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.background = d ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.03)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"; e.currentTarget.style.color = d ? "#64748b" : "#64748b"; e.currentTarget.style.background = "transparent"; }}
      >
        <i className="bi bi-person-plus" style={{ fontSize: "15px" }} />New user? Create account
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
        <i className="bi bi-shield-check" style={{ color: "#10b981", fontSize: "12px" }} />
        <span style={{ fontSize: "11px", color: d ? "#334155" : "#94a3b8" }}>Secured with JWT &amp; MongoDB Atlas</span>
      </div>
    </div>
  );
}