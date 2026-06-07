import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import TaskModal from "../components/TaskModal";
import ReportModal from "../components/ReportModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const FILTERS = ["All", "Pending", "Done"];

export default function Dashboard() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const isDark    = theme === "dark";

  const {
    tasks, allTasks, loading,
    search, setSearch,
    filter, setFilter,
    page, setPage, totalPages,
    filteredCount,
    addTask, updateTask, deleteTask, toggleTask, deleteAllTasks,
  } = useTasks();

  const [modalOpen,     setModalOpen]     = useState(false);
  const [reportOpen,    setReportOpen]    = useState(false);
  const [confirmOpen,   setConfirmOpen]   = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [editTask,      setEditTask]      = useState(null);
  const [view,          setView]          = useState("grid");
  const [activeFilter,  setActiveFilter]  = useState("All");

  const openAdd  = () => { setEditTask(null); setModalOpen(true); };
  const openEdit = (t) => { setEditTask(t);   setModalOpen(true); };
  const handleSave = (data) => {
    if (editTask) updateTask(editTask._id, data);
    else addTask(data);
  };
  const handleFilter = (f) => {
    setActiveFilter(f);
    setFilter(f === "All" ? "all" : f === "Pending" ? "pending" : "completed");
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    await deleteAllTasks();
    setDeleting(false);
    setConfirmOpen(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const total    = allTasks.length;
  const done     = allTasks.filter(t => t.status === "completed").length;
  const pending  = total - done;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue  = allTasks.filter(t => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const isFilter = search.trim() !== "" || filter !== "all";
  const c = (l, d) => isDark ? d : l;

  return (
    <div style={{ minHeight:"100vh", background: c("#f6f6fb","#09090f"), fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ maxWidth:"1040px", margin:"0 auto", padding:"2rem 1.5rem" }}>

        {/* ══ HEADER ══ */}
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"1.8rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <p style={{ fontSize:"11px", fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color: c("#94a3b8","#475569"), marginBottom:"5px" }}>
              {new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color: c("#0f172a","#f1f5f9"), lineHeight:1.15, margin:0 }}>
              {greeting()}, <span style={{ color:"#6366f1" }}>{user?.name?.split(" ")[0] || "there"}</span>
            </h1>
            <p style={{ fontSize:"13px", color: c("#64748b","#64748b"), marginTop:"4px" }}>
              {pending > 0 ? `${pending} task${pending!==1?"s":""} pending` : total > 0 ? "All tasks done — great work!" : "No tasks yet. Start fresh."}
              {overdue > 0 && <span style={{ color:"#ef4444", fontWeight:700, marginLeft:"8px" }}>· {overdue} overdue</span>}
            </p>
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {/* Report */}
            <button onClick={()=>setReportOpen(true)} style={{
              display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px",
              borderRadius:"12px", border:`1.5px solid ${c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)")}`,
              background:"transparent", color: c("#475569","#94a3b8"),
              fontSize:"13px", fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
              transition:"all 0.18s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#6366f1";e.currentTarget.style.color="#6366f1";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)");e.currentTarget.style.color=c("#475569","#94a3b8");}}>
              <i className="bi bi-graph-up" style={{ fontSize:"14px" }} />
              Report
            </button>

            {/* Delete All */}
            {total > 0 && (
              <button onClick={()=>setConfirmOpen(true)} style={{
                display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px",
                borderRadius:"12px", border:"1.5px solid rgba(239,68,68,0.25)",
                background:"rgba(239,68,68,0.05)", color:"#ef4444",
                fontSize:"13px", fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
                transition:"all 0.18s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.12)";e.currentTarget.style.borderColor="rgba(239,68,68,0.5)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.05)";e.currentTarget.style.borderColor="rgba(239,68,68,0.25)";}}>
                <i className="bi bi-trash3" style={{ fontSize:"13px" }} />
                Clear All
              </button>
            )}

            {/* New Task */}
            <button onClick={openAdd} style={{
              display:"flex", alignItems:"center", gap:"7px", padding:"10px 20px",
              borderRadius:"12px", border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white",
              fontSize:"13.5px", fontWeight:700, fontFamily:"'DM Sans',sans-serif",
              boxShadow:"0 6px 18px rgba(99,102,241,0.35)", transition:"transform 0.15s,box-shadow 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 10px 24px rgba(99,102,241,0.45)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 18px rgba(99,102,241,0.35)";}}>
              <i className="bi bi-plus-lg" style={{ fontSize:"16px" }} />
              New Task
            </button>
          </div>
        </div>

        {/* ══ STATS ══ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"10px", marginBottom:"1.8rem" }}>
          {[
            { label:"Total",    val:total,    icon:"bi-collection",        color:"#6366f1", bg:c("rgba(99,102,241,0.07)","rgba(99,102,241,0.12)") },
            { label:"Done",     val:done,     icon:"bi-check-circle-fill", color:"#10b981", bg:c("rgba(16,185,129,0.07)","rgba(16,185,129,0.12)") },
            { label:"Pending",  val:pending,  icon:"bi-hourglass-split",   color:"#f59e0b", bg:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.12)") },
            { label:"Overdue",  val:overdue,  icon:"bi-exclamation-circle",color:"#ef4444", bg:c("rgba(239,68,68,0.07)","rgba(239,68,68,0.12)") },
            { label:"Progress", val:`${pct}%`,icon:"bi-bar-chart-fill",   color:"#0ea5e9", bg:c("rgba(14,165,233,0.07)","rgba(14,165,233,0.12)") },
          ].map(s => (
            <div key={s.label} style={{ borderRadius:"16px", padding:"14px 16px", background:c("#ffffff","#12121e"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:c("0 1px 4px rgba(0,0,0,0.05)","none") }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"9px" }}>
                <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:c("#94a3b8","#475569") }}>{s.label}</span>
                <div style={{ width:"28px", height:"28px", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", background:s.bg }}>
                  <i className={`bi ${s.icon}`} style={{ color:s.color, fontSize:"13px" }} />
                </div>
              </div>
              <p style={{ fontSize:"20px", fontWeight:800, color:s.label==="Overdue"&&overdue>0?"#ef4444":c("#0f172a","#f1f5f9"), fontFamily:"'Playfair Display',serif", margin:"0 0 5px" }}>{s.val}</p>
              {s.label==="Progress" && (
                <div style={{ height:"3px", borderRadius:"10px", background:c("rgba(0,0,0,0.06)","rgba(255,255,255,0.06)") }}>
                  <div style={{ height:"100%", width:`${pct}%`, borderRadius:"10px", background:"linear-gradient(90deg,#6366f1,#0ea5e9)", transition:"width 0.6s ease" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ══ TOOLBAR ══ */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"1.2rem", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:"180px" }}>
            <i className="bi bi-search" style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:c("#94a3b8","#475569"), fontSize:"13px", pointerEvents:"none" }} />
            <input style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:"11px", border:`1.5px solid ${c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)")}`, background:c("#ffffff","#12121e"), color:c("#0f172a","#f1f5f9"), fontSize:"13px", fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"border-color 0.2s,box-shadow 0.2s", boxSizing:"border-box" }}
              placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)}
              onFocus={e=>{e.target.style.borderColor="#6366f1";e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)";}}
              onBlur={e=>{e.target.style.borderColor=c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)");e.target.style.boxShadow="none";}} />
            {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:c("#94a3b8","#475569"), fontSize:"13px", padding:0 }}><i className="bi bi-x-circle-fill" /></button>}
          </div>
          <div style={{ display:"flex", gap:"4px", padding:"3px", borderRadius:"11px", background:c("rgba(0,0,0,0.04)","rgba(255,255,255,0.04)"), border:`1px solid ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.07)")}` }}>
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>handleFilter(f)} style={{ padding:"6px 14px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s", background:activeFilter===f?"linear-gradient(135deg,#6366f1,#0ea5e9)":"transparent", color:activeFilter===f?"white":c("#64748b","#64748b"), boxShadow:activeFilter===f?"0 2px 8px rgba(99,102,241,0.3)":"none" }}>{f}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:"3px", padding:"3px", borderRadius:"11px", background:c("rgba(0,0,0,0.04)","rgba(255,255,255,0.04)"), border:`1px solid ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.07)")}` }}>
            {[{v:"grid",icon:"bi-grid-3x3-gap"},{v:"list",icon:"bi-list-ul"}].map(({v,icon})=>(
              <button key={v} onClick={()=>setView(v)} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:view===v?c("#ffffff","rgba(255,255,255,0.1)"):"transparent", color:view===v?"#6366f1":c("#94a3b8","#475569"), boxShadow:view===v?"0 1px 4px rgba(0,0,0,0.1)":"none", transition:"all 0.18s" }}>
                <i className={`bi ${icon}`} style={{ fontSize:"14px" }} />
              </button>
            ))}
          </div>
        </div>

        {isFilter && !loading && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
            <p style={{ fontSize:"12px", color:c("#94a3b8","#475569"), margin:0 }}>
              <span style={{ fontWeight:700, color:c("#0f172a","#f1f5f9") }}>{filteredCount}</span> result{filteredCount!==1?"s":""}
              {search&&<> for <span style={{ color:"#6366f1", fontWeight:600 }}>"{search}"</span></>}
            </p>
            <button onClick={()=>{setSearch("");handleFilter("All");}} style={{ fontSize:"12px", color:"#6366f1", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Clear</button>
          </div>
        )}

        {/* ══ TASKS ══ */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:view==="grid"?"repeat(auto-fill,minmax(290px,1fr))":"1fr", gap:"14px" }}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{ height:view==="grid"?"180px":"72px", borderRadius:"18px", background:c("#ffffff","#12121e"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, animation:"pulse 1.5s ease-in-out infinite", animationDelay:`${i*100}ms` }} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"4rem 2rem", borderRadius:"20px", background:c("#ffffff","#12121e"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}` }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", background:c("rgba(99,102,241,0.07)","rgba(99,102,241,0.1)") }}>
              <i className={`bi ${isFilter?"bi-funnel":"bi-clipboard-plus"}`} style={{ fontSize:"24px", color:"#6366f1" }} />
            </div>
            <p style={{ fontWeight:700, fontSize:"15px", color:c("#0f172a","#f1f5f9"), margin:"0 0 6px" }}>{isFilter?"No matching tasks":"Nothing here yet"}</p>
            <p style={{ fontSize:"13px", color:c("#94a3b8","#475569"), margin:"0 0 20px" }}>{isFilter?"Try a different search or filter":"Hit New Task to add your first one"}</p>
            {isFilter
              ? <button onClick={()=>{setSearch("");handleFilter("All");}} style={{ padding:"9px 20px", borderRadius:"10px", border:`1.5px solid ${c("rgba(0,0,0,0.1)","rgba(255,255,255,0.1)")}`, background:"transparent", color:c("#64748b","#94a3b8"), fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Clear filters</button>
              : <button onClick={openAdd} style={{ padding:"9px 20px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 14px rgba(99,102,241,0.3)" }}>Add first task</button>
            }
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:view==="grid"?"repeat(auto-fill,minmax(290px,1fr))":"1fr", gap:"14px", alignItems:"start" }}>
            {tasks.map((task,i)=>(
              <TaskCard key={task._id} task={task} view={view} isDark={isDark} onToggle={toggleTask} onDelete={deleteTask} onEdit={openEdit} index={i} />
            ))}
          </div>
        )}

        {/* ══ PAGINATION ══ */}
        {totalPages>1&&(
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", marginTop:"1.8rem" }}>
            <PgBtn disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} isDark={isDark}><i className="bi bi-chevron-left"/></PgBtn>
            {[...Array(totalPages)].map((_,i)=>(
              <button key={i} onClick={()=>setPage(i+1)} style={{ width:"34px", height:"34px", borderRadius:"10px", border:page===i+1?"none":`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`, cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:page===i+1?"linear-gradient(135deg,#6366f1,#0ea5e9)":isDark?"#12121e":"#ffffff", color:page===i+1?"white":isDark?"#64748b":"#64748b", boxShadow:page===i+1?"0 3px 10px rgba(99,102,241,0.3)":"none" }}>{i+1}</button>
            ))}
            <PgBtn disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} isDark={isDark}><i className="bi bi-chevron-right"/></PgBtn>
          </div>
        )}
      </div>

      <TaskModal   open={modalOpen}  onClose={()=>setModalOpen(false)}  onSave={handleSave} task={editTask} isDark={isDark} />
      <ReportModal open={reportOpen} onClose={()=>setReportOpen(false)} tasks={allTasks}    isDark={isDark} user={user} />

      {/* ══ CONFIRM DELETE ALL MODAL ══ */}
      {confirmOpen && (
        <div onClick={()=>!deleting&&setConfirmOpen(false)} style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:c("#ffffff","#12121e"), borderRadius:"20px", width:"100%", maxWidth:"380px", overflow:"hidden", border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.06)")}`, boxShadow:"0 24px 64px rgba(0,0,0,0.2)", animation:"modalIn 0.25s ease both" }}>
            {/* Red top bar */}
            <div style={{ height:"3px", background:"linear-gradient(90deg,#ef4444,#f87171)" }} />
            <div style={{ padding:"24px" }}>
              {/* Icon */}
              <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"rgba(239,68,68,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
                <i className="bi bi-trash3-fill" style={{ fontSize:"20px", color:"#ef4444" }} />
              </div>
              {/* Text */}
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.15rem", fontWeight:800, color:c("#0f172a","#f1f5f9"), margin:"0 0 8px" }}>
                Delete all tasks?
              </h3>
              <p style={{ fontSize:"13px", color:c("#64748b","#64748b"), margin:"0 0 6px", lineHeight:1.6 }}>
                This will permanently delete all <span style={{ fontWeight:700, color:c("#0f172a","#f1f5f9") }}>{total} task{total!==1?"s":""}</span> including completed ones.
              </p>
              <p style={{ fontSize:"12px", color:"#ef4444", fontWeight:600, margin:"0 0 22px" }}>
                This action cannot be undone.
              </p>
              {/* Buttons */}
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={()=>setConfirmOpen(false)} disabled={deleting} style={{ flex:1, padding:"11px", borderRadius:"12px", border:`1.5px solid ${c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)")}`, background:"transparent", color:c("#64748b","#64748b"), fontSize:"13px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:deleting?"not-allowed":"pointer", opacity:deleting?0.5:1 }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAll} disabled={deleting} style={{ flex:1, padding:"11px", borderRadius:"12px", border:"none", background:deleting?"rgba(239,68,68,0.5)":"linear-gradient(135deg,#ef4444,#f87171)", color:"white", fontSize:"13px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:deleting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", transition:"all 0.18s" }}>
                  {deleting
                    ? <><i className="bi bi-arrow-repeat" style={{ fontSize:"13px", animation:"spin 0.8s linear infinite" }} /> Deleting...</>
                    : <><i className="bi bi-trash3" style={{ fontSize:"13px" }} /> Delete All</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
        @keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes overdueFlash{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────
function PgBtn({ children, disabled, onClick, isDark }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:"34px", height:"34px", borderRadius:"10px", border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`, background:isDark?"#12121e":"#ffffff", color:isDark?"#64748b":"#64748b", cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:disabled?0.35:1, fontSize:"13px" }}>
      {children}
    </button>
  );
}

export function getTimeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff/60000);
  const hours = Math.floor(diff/3600000);
  const days  = Math.floor(diff/86400000);
  if (mins<1)   return "just now";
  if (mins<60)  return `${mins}m ago`;
  if (hours<24) return `${hours}h ago`;
  if (days<7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) + " at " +
    d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
}

export function getDueStatus(task) {
  if (!task.dueDate) return null;
  const now = new Date();
  const due = new Date(task.dueDate);
  if (task.status==="completed") {
    if (task.completedAt && new Date(task.completedAt)<=due) return "on-time";
    return "late";
  }
  if (due<now) return "overdue";
  const diffMs = due-now;
  const diffH  = diffMs/3600000;
  if (diffH<24) return "due-soon";
  return "ok";
}

// ── TaskCard ──────────────────────────────
function TaskCard({ task, view, isDark, onToggle, onDelete, onEdit, index }) {
  const [hovered,  setHovered]  = useState(false);
  const [toggling, setToggling] = useState(false);
  const done      = task.status === "completed";
  const dueStatus = getDueStatus(task);
  const c = (l, d) => isDark ? d : l;

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(task._id);
    setTimeout(()=>setToggling(false),400);
  };

  const DueBadge = () => {
    if (!dueStatus||dueStatus==="ok") return null;
    const meta = {
      overdue:   { label:"Overdue",        color:"#ef4444", bg:"rgba(239,68,68,0.1)",    icon:"bi-alarm-fill",    pulse:true  },
      "due-soon":{ label:"Due soon",       color:"#f59e0b", bg:"rgba(245,158,11,0.1)",   icon:"bi-alarm",         pulse:false },
      "on-time": { label:"On time",        color:"#10b981", bg:"rgba(16,185,129,0.1)",   icon:"bi-check2-circle", pulse:false },
      late:      { label:"Completed late", color:"#f87171", bg:"rgba(248,113,113,0.08)", icon:"bi-clock-history", pulse:false },
    }[dueStatus];
    return (
      <span style={{ fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"100px", background:meta.bg, color:meta.color, display:"inline-flex", alignItems:"center", gap:"4px", animation:meta.pulse?"overdueFlash 1.5s ease-in-out infinite":undefined }}>
        <i className={`bi ${meta.icon}`} style={{ fontSize:"9px" }} />{meta.label}
      </span>
    );
  };

  if (view==="list") {
    return (
      <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 18px", borderRadius:"14px", background:c("#ffffff","#12121e"), border:`1px solid ${hovered?"#6366f1":c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:hovered?"0 4px 16px rgba(99,102,241,0.12)":c("0 1px 3px rgba(0,0,0,0.04)","none"), transition:"all 0.2s ease", animation:"slideUp 0.3s ease both", animationDelay:`${index*40}ms` }}>
        <button onClick={handleToggle} style={{ width:"22px", height:"22px", borderRadius:"50%", flexShrink:0, cursor:"pointer", border:done?"none":`2px solid ${c("rgba(0,0,0,0.15)","rgba(255,255,255,0.15)")}`, background:done?"linear-gradient(135deg,#10b981,#34d399)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s", transform:toggling?"scale(0.85)":"scale(1)" }}>
          {done&&<i className="bi bi-check" style={{ color:"white", fontSize:"12px", animation:"checkPop 0.3s ease" }} />}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:"13.5px", fontWeight:600, margin:"0 0 2px", color:done?c("#94a3b8","#4b5563"):c("#0f172a","#f1f5f9"), textDecoration:done?"line-through":"none", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{task.title}</p>
          {task.description&&<p style={{ fontSize:"12px", color:c("#94a3b8","#475569"), margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{task.description}</p>}
        </div>
        <DueBadge/>
        <span style={{ fontSize:"10.5px", fontWeight:700, padding:"3px 10px", borderRadius:"100px", flexShrink:0, background:done?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color:done?"#10b981":"#f59e0b", display:"flex", alignItems:"center", gap:"5px" }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:done?"#10b981":"#f59e0b", display:"inline-block" }} />
          {done?"Completed":"Pending"}
        </span>
        <span style={{ fontSize:"11px", color:c("#94a3b8","#475569"), flexShrink:0, whiteSpace:"nowrap" }}>
          {new Date(task.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
        </span>
        <div style={{ display:"flex", gap:"4px", opacity:hovered?1:0, transition:"opacity 0.15s" }}>
          <ABtn icon="bi-pencil" color="#6366f1" bg="rgba(99,102,241,0.1)" onClick={()=>onEdit(task)}/>
          <ABtn icon="bi-trash"  color="#ef4444" bg="rgba(239,68,68,0.1)"  onClick={()=>onDelete(task._id)}/>
        </div>
      </div>
    );
  }

  const topBarColor = done
    ? "linear-gradient(90deg,#10b981,#34d399)"
    : dueStatus==="overdue"
      ? "linear-gradient(90deg,#ef4444,#f87171)"
      : hovered ? "linear-gradient(90deg,#6366f1,#0ea5e9,#6366f1)" : "linear-gradient(90deg,#6366f1,#0ea5e9)";

  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ borderRadius:"20px", position:"relative", overflow:"hidden", background:c("#ffffff","#12121e"), border:`1px solid ${dueStatus==="overdue"&&!done?"rgba(239,68,68,0.4)":hovered?"rgba(99,102,241,0.4)":c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:hovered?c("0 12px 32px rgba(99,102,241,0.15)","0 12px 32px rgba(99,102,241,0.12)"):dueStatus==="overdue"&&!done?"0 0 0 1px rgba(239,68,68,0.2)":c("0 1px 4px rgba(0,0,0,0.05)","none"), transition:"all 0.25s ease", animation:"slideUp 0.35s ease both", animationDelay:`${index*55}ms`, display:"flex", flexDirection:"column" }}>
      <div style={{ height:"3px", flexShrink:0, background:topBarColor, transition:"all 0.3s", boxShadow:hovered?`0 0 8px ${done?"#10b981":dueStatus==="overdue"?"#ef4444":"rgba(99,102,241,0.6)"}`:undefined }} />
      <div style={{ padding:"18px", display:"flex", flexDirection:"column", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"10.5px", fontWeight:700, padding:"3px 9px", borderRadius:"100px", background:done?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.09)", color:done?"#10b981":"#f59e0b", display:"flex", alignItems:"center", gap:"4px" }}>
              <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:done?"#10b981":"#f59e0b", display:"inline-block" }} />
              {done?"Done":"Pending"}
            </span>
            <DueBadge/>
          </div>
          <div style={{ display:"flex", gap:"4px", opacity:hovered?1:0, transition:"opacity 0.18s" }}>
            <ABtn icon="bi-pencil" color="#6366f1" bg="rgba(99,102,241,0.1)" onClick={()=>onEdit(task)}/>
            <ABtn icon="bi-trash"  color="#ef4444" bg="rgba(239,68,68,0.1)"  onClick={()=>onDelete(task._id)}/>
          </div>
        </div>
        <p style={{ fontSize:"14.5px", fontWeight:700, margin:"0 0 7px", color:done?c("#94a3b8","#4b5563"):c("#0f172a","#f1f5f9"), textDecoration:done?"line-through":"none", lineHeight:1.4, wordBreak:"break-word" }}>{task.title}</p>
        {task.description&&<p style={{ fontSize:"12.5px", color:c("#64748b","#64748b"), margin:"0 0 14px", lineHeight:1.65, wordBreak:"break-word" }}>{task.description}</p>}
        <div style={{ flex:1 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"10px" }}>
          <i className="bi bi-calendar-event" style={{ fontSize:"10px", color:c("#cbd5e1","#334155") }}/>
          <span style={{ fontSize:"10.5px", color:c("#94a3b8","#475569") }}>{formatDateTime(task.createdAt)}</span>
        </div>
        {task.dueDate&&(
          <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"12px", padding:"6px 10px", borderRadius:"9px", background:dueStatus==="overdue"&&!done?"rgba(239,68,68,0.06)":c("rgba(0,0,0,0.025)","rgba(255,255,255,0.03)") }}>
            <i className="bi bi-flag-fill" style={{ fontSize:"10px", color:dueStatus==="overdue"&&!done?"#ef4444":dueStatus==="due-soon"?"#f59e0b":c("#94a3b8","#475569") }}/>
            <span style={{ fontSize:"10.5px", fontWeight:600, color:dueStatus==="overdue"&&!done?"#ef4444":dueStatus==="due-soon"?"#f59e0b":c("#64748b","#64748b") }}>
              Target: {new Date(task.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} at {new Date(task.dueDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
            </span>
          </div>
        )}
        <div style={{ height:"1px", background:c("rgba(0,0,0,0.05)","rgba(255,255,255,0.05)"), marginBottom:"12px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={handleToggle} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"5px 12px", borderRadius:"9px", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px", fontWeight:700, transition:"all 0.2s", background:done?"rgba(16,185,129,0.1)":"rgba(99,102,241,0.08)", color:done?"#10b981":"#6366f1", transform:toggling?"scale(0.93)":"scale(1)" }}>
            <div style={{ width:"16px", height:"16px", borderRadius:"50%", border:done?"none":`2px solid ${c("rgba(0,0,0,0.15)","rgba(255,255,255,0.2)")}`, background:done?"linear-gradient(135deg,#10b981,#34d399)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s", flexShrink:0 }}>
              {done&&<i className="bi bi-check" style={{ color:"white", fontSize:"9px" }}/>}
            </div>
            {done?"Completed":"Mark done"}
          </button>
          <span style={{ fontSize:"11px", color:c("#94a3b8","#475569"), display:"flex", alignItems:"center", gap:"4px" }}>
            <i className="bi bi-clock" style={{ fontSize:"10px" }}/>
            {getTimeAgo(task.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ABtn({ icon, color, bg, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:"26px", height:"26px", borderRadius:"8px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:h?bg:"transparent", color, fontSize:"12px", transition:"all 0.15s" }}>
      <i className={`bi ${icon}`}/>
    </button>
  );
}