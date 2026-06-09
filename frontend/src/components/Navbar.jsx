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

  // Get first name only
  const firstName = user?.name?.split(" ")[0] || "User";
  const avatarLetter = firstName[0]?.toUpperCase() || "U";
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";

  const c = (light, dark) => isDark ? dark : light;

  return (
    <>
      {/* Navbar */}
      <div style={{
        position: "fixed", top: "10px", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "calc(100% - 1.5rem)",
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
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>

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
                background: isDark ? "#1e293b" : "#e2e8f0",
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
                left: isDark ? "calc(100% - 24px)" : "2px",
                transition: "left 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}>
                <i className={`bi bi-${isDark ? "moon" : "sun"}`} style={{ 
                  fontSize: "10px", 
                  color: isDark ? "#6366f1" : "#f59e0b",
                }} />
              </div>
              <i className="bi bi-sun" style={{ fontSize: "10px", color: "#f59e0b", opacity: isDark ? 0.5 : 1, marginLeft: "2px" }} />
              <i className="bi bi-moon" style={{ fontSize: "10px", color: "#6366f1", opacity: isDark ? 1 : 0.5, marginRight: "2px" }} />
            </button>

            {/* Divider - Hide on very small screens */}
            <div style={{ 
              width:"1px", 
              height:"20px", 
              background: c("rgba(0,0,0,0.1)","rgba(255,255,255,0.1)"), 
              margin:"0 2px",
              display: window.innerWidth < 480 ? "none" : "block",
            }} />

            {/* User section - Responsive */}
            {user && (
              <>
                {/* Mobile: Avatar only */}
                <div className="mobile-user" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "3px",
                  borderRadius: "100px",
                  background: c("rgba(0,0,0,0.04)","rgba(255,255,255,0.05)"),
                  border: `1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.07)")}`,
                }}>
                  <div style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {avatarLetter}
                  </div>
                  <span className="user-name" style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: c("#0f172a","#e2e8f0"),
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {firstName}
                  </span>
                </div>

                {/* Logout Button - Separate pill with red color */}
                <button
                  onMouseEnter={()=>setHoverLogout(true)}
                  onMouseLeave={()=>setHoverLogout(false)}
                  onClick={()=>{ logout(); navigate("/"); }}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    gap:"6px",
                    padding:"6px 12px 6px 10px",
                    borderRadius:"100px",
                    border:"none",
                    cursor:"pointer",
                    fontSize:"12.5px",
                    fontWeight:700,
                    fontFamily:"'DM Sans',sans-serif",
                    transition:"all 0.2s ease",
                    background: hoverLogout
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}>
                  <i className="bi bi-box-arrow-right" style={{ fontSize:"13px" }} />
                  <span className="logout-label">Logout</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Spacer */}
      <div style={{ height: "56px" }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        /* Mobile styles */
        @media (max-width: 480px) {
          .logout-label {
            display: none !important;
          }
          .user-name {
            display: none !important;
          }
          .mobile-user {
            padding: 3px !important;
          }
        }
        
        /* Tablet and desktop */
        @media (min-width: 481px) {
          .logout-label {
            display: inline !important;
          }
          .user-name {
            display: inline !important;
          }
          .mobile-user {
            padding: 3px 10px 3px 3px !important;
          }
        }
      `}</style>
    </>
  );
}