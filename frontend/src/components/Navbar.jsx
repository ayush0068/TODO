import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoverLogout, setHoverLogout] = useState(false);
  const isDark = theme === "dark";

  const initials = user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";
  const c = (light, dark) => isDark ? dark : light;

  return (
    <>
      {/* Navbar */}
      <div style={{
        position: "fixed", top: "10px", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "calc(100% - 3rem)",
        maxWidth: "720px",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 6px 6px 14px",
          borderRadius: "100px",
          background: isDark
            ? "rgba(18,18,30,0.75)"
            : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: `1px solid ${c("rgba(255,255,255,0.9)","rgba(255,255,255,0.08)")}`,
          boxShadow: isDark
            ? "0 2px 24px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.06) inset"
            : "0 2px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04) inset, 0 1px 0 rgba(255,255,255,0.9) inset",
        }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
            <div style={{
              width:"30px", height:"30px", borderRadius:"50%",
              background:"linear-gradient(135deg,#6366f1,#0ea5e9)",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink: 0,
            }}>
              <i className="bi bi-check2-square" style={{ color:"white", fontSize:"14px" }} />
            </div>
            <span style={{
              fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"16px",
              color: c("#0f172a","#f1f5f9"), letterSpacing:"-0.2px",
              whiteSpace: "nowrap",
            }}>TaskFlow</span>
          </div>

          {/* Right controls */}
          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>

            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              width:"34px", height:"34px", borderRadius:"50%", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              background: "transparent",
              color: c("#475569","#94a3b8"), fontSize:"15px",
              transition:"background 0.18s",
            }}
              onMouseEnter={e=>e.currentTarget.style.background=c("rgba(0,0,0,0.06)","rgba(255,255,255,0.08)")}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <i className={`bi bi-${isDark?"sun":"moon"}`} style={{ color: isDark?"#f59e0b":"#6366f1" }} />
            </button>

            {/* Divider */}
            <div style={{ width:"1px", height:"16px", background: c("rgba(0,0,0,0.1)","rgba(255,255,255,0.1)"), margin:"0 2px" }} />

            {/* User pill */}
            {user && (
              <div style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding:"3px 10px 3px 3px",
                borderRadius:"100px",
                background: c("rgba(0,0,0,0.04)","rgba(255,255,255,0.05)"),
                border: `1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.07)")}`,
              }}>
                <div style={{
                  width:"26px", height:"26px", borderRadius:"50%",
                  background:"linear-gradient(135deg,#6366f1,#0ea5e9)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"white", fontSize:"10px", fontWeight:800, flexShrink:0,
                }}>
                  {initials}
                </div>
                <span style={{
                  fontSize:"12.5px", fontWeight:600,
                  color: c("#0f172a","#e2e8f0"),
                  maxWidth:"90px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>
                  {user.name}
                </span>
              </div>
            )}

            {/* Logout pill button */}
            <button
              onMouseEnter={()=>setHoverLogout(true)}
              onMouseLeave={()=>setHoverLogout(false)}
              onClick={()=>{ logout(); navigate("/"); }}
              style={{
                display:"flex", alignItems:"center", gap:"5px",
                padding:"7px 14px 7px 10px",
                borderRadius:"100px", border:"none", cursor:"pointer",
                fontSize:"12.5px", fontWeight:700, fontFamily:"'DM Sans',sans-serif",
                transition:"all 0.18s",
                background: hoverLogout
                  ? "rgba(239,68,68,0.12)"
                  : c("rgba(0,0,0,0.05)","rgba(255,255,255,0.07)"),
                color: hoverLogout ? "#ef4444" : c("#64748b","#94a3b8"),
                outline: hoverLogout
                  ? "1px solid rgba(239,68,68,0.25)"
                  : `1px solid ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.08)")}`,
              }}>
              <i className="bi bi-box-arrow-right" style={{ fontSize:"13px" }} />
              <span className="logout-label">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Spacer */}
      <div style={{ height: "56px" }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .logout-label { display: none; }
        @media(min-width: 480px) { .logout-label { display: inline; } }
      `}</style>
    </>
  );
}