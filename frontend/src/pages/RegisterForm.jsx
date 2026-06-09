export default function RegisterForm({
  rForm, setR, rErr, rShowPw, setRShowPw, rLoading,
  handleRegister, switchTo, animating,
  focusedInput, setFocusedInput,
  inp, iconSt, errLine, labelSt, isDark,
  pwStr, strMeta,
}) {
  const d = isDark;

  return (
    <div>
      {/* Header */}
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
        <button
          type="submit"
          disabled={rLoading}
          style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", marginTop: "2px", background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)", color: "white", fontSize: "13.5px", fontWeight: 700, cursor: rLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 6px 22px rgba(14,165,233,0.32)", transition: "transform 0.15s,box-shadow 0.15s" }}
          onMouseEnter={e => { if (!rLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(14,165,233,0.42)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(14,165,233,0.32)"; }}
        >
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

      <button
        onClick={() => switchTo("login")}
        disabled={animating}
        style={{ width: "100%", padding: "12px", borderRadius: "12px", cursor: "pointer", border: `1.5px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13.5px", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: d ? "#64748b" : "#64748b", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#0ea5e9"; e.currentTarget.style.background = d ? "rgba(14,165,233,0.05)" : "rgba(14,165,233,0.03)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = d ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"; e.currentTarget.style.color = d ? "#64748b" : "#64748b"; e.currentTarget.style.background = "transparent"; }}
      >
        <i className="bi bi-arrow-left" style={{ fontSize: "14px" }} />Already have an account? Sign in
      </button>

      <p style={{ textAlign: "center", fontSize: "10.5px", color: d ? "#334155" : "#9ca3af", marginTop: "14px", lineHeight: 1.7 }}>
        By creating an account, you agree to our terms.
      </p>
    </div>
  );
}