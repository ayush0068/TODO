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
    addTask, updateTask, deleteTask, toggleTask,
  } = useTasks();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [reportOpen,   setReportOpen]   = useState(false);
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [view,         setView]         = useState("grid");
  const [activeFilter, setActiveFilter] = useState("All");

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
    // delete one by one since deleteAllTasks may not exist
    for (const t of allTasks) await deleteTask(t._id);
    setDeleting(false);
    setConfirmOpen(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const total   = allTasks.length;
  const done    = allTasks.filter(t => t.status === "completed").length;
  const pending = total - done;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = allTasks.filter(t => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const isFilter = search.trim() !== "" || filter !== "all";
  const c = (l, d) => isDark ? d : l;

  return (
    <div style={{ minHeight:"100vh", background:c("#f6f6fb","#09090f"), fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ maxWidth:"1040px", margin:"0 auto", padding:"1.25rem 1rem" }}>

        {/* ══ HEADER ══ */}
        <div className="dash-header">
          <div style={{ minWidth:0 }}>
            <p className="dash-date">
              {new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
            </p>
            <h1 className="dash-greeting" style={{ color:c("#0f172a","#f1f5f9") }}>
              {greeting()},{" "}
              <span style={{ color:"#6366f1" }}>{user?.name?.split(" ")[0] || "there"}</span>
            </h1>
            <p className="dash-sub" style={{ color:c("#64748b","#64748b") }}>
              {pending > 0 ? `${pending} task${pending!==1?"s":""} pending` : total > 0 ? "All tasks done — great work!" : "No tasks yet. Start fresh."}
              {overdue > 0 && <span style={{ color:"#ef4444", fontWeight:700 }}> · {overdue} overdue</span>}
            </p>
          </div>
          <div className="dash-actions">
            <button className="btn-ghost" style={{ color:c("#475569","#94a3b8"), borderColor:c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)") }}
              onClick={()=>setReportOpen(true)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#6366f1";e.currentTarget.style.color="#6366f1";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)");e.currentTarget.style.color=c("#475569","#94a3b8");}}>
              <i className="bi bi-graph-up" />
              <span className="btn-label">Report</span>
            </button>
            {total > 0 && (
              <button className="btn-danger" onClick={()=>setConfirmOpen(true)}>
                <i className="bi bi-trash3" />
                <span className="btn-label">Clear All</span>
              </button>
            )}
            <button className="btn-primary-grad" onClick={openAdd}>
              <i className="bi bi-plus-lg" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* ══ STATS ══ */}
        <div className="stats-grid">
          {[
            { label:"Total",    val:total,    icon:"bi-collection",        color:"#6366f1", bg:c("rgba(99,102,241,0.07)","rgba(99,102,241,0.12)") },
            { label:"Done",     val:done,     icon:"bi-check-circle-fill", color:"#10b981", bg:c("rgba(16,185,129,0.07)","rgba(16,185,129,0.12)") },
            { label:"Pending",  val:pending,  icon:"bi-hourglass-split",   color:"#f59e0b", bg:c("rgba(245,158,11,0.07)","rgba(245,158,11,0.12)") },
            { label:"Overdue",  val:overdue,  icon:"bi-exclamation-circle",color:"#ef4444", bg:c("rgba(239,68,68,0.07)","rgba(239,68,68,0.12)") },
            { label:"Progress", val:`${pct}%`,icon:"bi-bar-chart-fill",   color:"#0ea5e9", bg:c("rgba(14,165,233,0.07)","rgba(14,165,233,0.12)") },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ background:c("#ffffff","#12121e"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"9px" }}>
                <span style={{ fontSize:"9.5px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", color:c("#94a3b8","#475569") }}>{s.label}</span>
                <div style={{ width:"26px", height:"26px", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", background:s.bg, flexShrink:0 }}>
                  <i className={`bi ${s.icon}`} style={{ color:s.color, fontSize:"12px" }} />
                </div>
              </div>
              <p style={{ fontSize:"19px", fontWeight:800, color:s.label==="Overdue"&&overdue>0?"#ef4444":c("#0f172a","#f1f5f9"), fontFamily:"'Playfair Display',serif", margin:"0 0 4px" }}>{s.val}</p>
              {s.label==="Progress"&&(
                <div style={{ height:"3px", borderRadius:"10px", background:c("rgba(0,0,0,0.06)","rgba(255,255,255,0.06)") }}>
                  <div style={{ height:"100%", width:`${pct}%`, borderRadius:"10px", background:"linear-gradient(90deg,#6366f1,#0ea5e9)", transition:"width 0.6s ease" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ══ TOOLBAR ══ */}
        <div className="toolbar">
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:"140px" }}>
            <i className="bi bi-search" style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:c("#94a3b8","#475569"), fontSize:"12px", pointerEvents:"none" }} />
            <input className="search-input" style={{ background:c("#ffffff","#12121e"), border:`1.5px solid ${c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)")}`, color:c("#0f172a","#f1f5f9") }}
              placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)}
              onFocus={e=>{e.target.style.borderColor="#6366f1";e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)";}}
              onBlur={e=>{e.target.style.borderColor=c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)");e.target.style.boxShadow="none";}} />
            {search&&<button onClick={()=>setSearch("")} style={{ position:"absolute",right:"9px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:c("#94a3b8","#475569"),fontSize:"12px",padding:0 }}><i className="bi bi-x-circle-fill"/></button>}
          </div>

          {/* Filter pills */}
          <div className="pill-group" style={{ background:c("rgba(0,0,0,0.04)","rgba(255,255,255,0.04)"), border:`1px solid ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.07)")}` }}>
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>handleFilter(f)} className="pill-btn" style={{ background:activeFilter===f?"linear-gradient(135deg,#6366f1,#0ea5e9)":"transparent", color:activeFilter===f?"white":c("#64748b","#64748b"), boxShadow:activeFilter===f?"0 2px 8px rgba(99,102,241,0.3)":"none" }}>{f}</button>
            ))}
          </div>

          {/* View toggle */}
          <div className="pill-group" style={{ background:c("rgba(0,0,0,0.04)","rgba(255,255,255,0.04)"), border:`1px solid ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.07)")}` }}>
            {[{v:"grid",icon:"bi-grid-3x3-gap"},{v:"list",icon:"bi-list-ul"}].map(({v,icon})=>(
              <button key={v} onClick={()=>setView(v)} className="view-btn" style={{ background:view===v?c("#ffffff","rgba(255,255,255,0.1)"):"transparent", color:view===v?"#6366f1":c("#94a3b8","#475569"), boxShadow:view===v?"0 1px 4px rgba(0,0,0,0.1)":"none" }}>
                <i className={`bi ${icon}`} style={{ fontSize:"13px" }} />
              </button>
            ))}
          </div>
        </div>

        {isFilter&&!loading&&(
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
            <p style={{ fontSize:"12px", color:c("#94a3b8","#475569"), margin:0 }}>
              <span style={{ fontWeight:700, color:c("#0f172a","#f1f5f9") }}>{filteredCount}</span> result{filteredCount!==1?"s":""}
              {search&&<> for <span style={{ color:"#6366f1", fontWeight:600 }}>"{search}"</span></>}
            </p>
            <button onClick={()=>{setSearch("");handleFilter("All");}} style={{ fontSize:"12px", color:"#6366f1", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Clear</button>
          </div>
        )}

        {/* ══ TASKS ══ */}
        {loading ? (
          <div className={view==="grid"?"task-grid":"task-list"}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{ height:view==="grid"?"160px":"66px", borderRadius:"16px", background:c("#ffffff","#12121e"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, animation:"pulse 1.5s ease-in-out infinite", animationDelay:`${i*100}ms` }} />
            ))}
          </div>
        ) : tasks.length===0 ? (
          <div style={{ textAlign:"center", padding:"3.5rem 1.5rem", borderRadius:"18px", background:c("#ffffff","#12121e"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}` }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"14px", margin:"0 auto 14px", display:"flex", alignItems:"center", justifyContent:"center", background:c("rgba(99,102,241,0.07)","rgba(99,102,241,0.1)") }}>
              <i className={`bi ${isFilter?"bi-funnel":"bi-clipboard-plus"}`} style={{ fontSize:"22px", color:"#6366f1" }} />
            </div>
            <p style={{ fontWeight:700, fontSize:"14px", color:c("#0f172a","#f1f5f9"), margin:"0 0 5px" }}>{isFilter?"No matching tasks":"Nothing here yet"}</p>
            <p style={{ fontSize:"12.5px", color:c("#94a3b8","#475569"), margin:"0 0 18px" }}>{isFilter?"Try a different search or filter":"Hit New Task to get started"}</p>
            {isFilter
              ? <button onClick={()=>{setSearch("");handleFilter("All");}} style={{ padding:"8px 18px", borderRadius:"10px", border:`1.5px solid ${c("rgba(0,0,0,0.1)","rgba(255,255,255,0.1)")}`, background:"transparent", color:c("#64748b","#94a3b8"), fontSize:"12.5px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Clear filters</button>
              : <button onClick={openAdd} style={{ padding:"8px 18px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:"12.5px", fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 14px rgba(99,102,241,0.3)" }}>Add first task</button>
            }
          </div>
        ) : (
          <div className={view==="grid"?"task-grid":"task-list"}>
            {tasks.map((task,i)=>(
              <TaskCard key={task._id} task={task} view={view} isDark={isDark} onToggle={toggleTask} onDelete={deleteTask} onEdit={openEdit} index={i} />
            ))}
          </div>
        )}

        {/* ══ PAGINATION ══ */}
        {totalPages>1&&(
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", marginTop:"1.5rem", flexWrap:"wrap" }}>
            <PgBtn disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} isDark={isDark}><i className="bi bi-chevron-left"/></PgBtn>
            {[...Array(totalPages)].map((_,i)=>(
              <button key={i} onClick={()=>setPage(i+1)} style={{ width:"32px", height:"32px", borderRadius:"9px", border:page===i+1?"none":`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`, cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:page===i+1?"linear-gradient(135deg,#6366f1,#0ea5e9)":isDark?"#12121e":"#ffffff", color:page===i+1?"white":isDark?"#64748b":"#64748b", boxShadow:page===i+1?"0 3px 10px rgba(99,102,241,0.3)":"none" }}>{i+1}</button>
            ))}
            <PgBtn disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} isDark={isDark}><i className="bi bi-chevron-right"/></PgBtn>
          </div>
        )}
      </div>

      <TaskModal   open={modalOpen}  onClose={()=>setModalOpen(false)}  onSave={handleSave} task={editTask} isDark={isDark} />
      <ReportModal open={reportOpen} onClose={()=>setReportOpen(false)} tasks={allTasks}    isDark={isDark} user={user} />

      {/* ══ CONFIRM DELETE ALL ══ */}
      {confirmOpen&&(
        <div onClick={()=>!deleting&&setConfirmOpen(false)} style={{ position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:c("#ffffff","#12121e"),borderRadius:"18px",width:"100%",maxWidth:"360px",overflow:"hidden",border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.06)")}`,boxShadow:"0 24px 64px rgba(0,0,0,0.2)",animation:"modalIn 0.25s ease both" }}>
            <div style={{ height:"3px",background:"linear-gradient(90deg,#ef4444,#f87171)" }}/>
            <div style={{ padding:"22px" }}>
              <div style={{ width:"44px",height:"44px",borderRadius:"12px",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"14px" }}>
                <i className="bi bi-trash3-fill" style={{ fontSize:"18px",color:"#ef4444" }}/>
              </div>
              <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",fontWeight:800,color:c("#0f172a","#f1f5f9"),margin:"0 0 7px" }}>Delete all tasks?</h3>
              <p style={{ fontSize:"13px",color:c("#64748b","#64748b"),margin:"0 0 5px",lineHeight:1.6 }}>
                Permanently deletes all <strong style={{ color:c("#0f172a","#f1f5f9") }}>{total} task{total!==1?"s":""}</strong>.
              </p>
              <p style={{ fontSize:"12px",color:"#ef4444",fontWeight:600,margin:"0 0 20px" }}>This cannot be undone.</p>
              <div style={{ display:"flex",gap:"8px" }}>
                <button onClick={()=>setConfirmOpen(false)} disabled={deleting} style={{ flex:1,padding:"10px",borderRadius:"11px",border:`1.5px solid ${c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)")}`,background:"transparent",color:c("#64748b","#64748b"),fontSize:"13px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:deleting?"not-allowed":"pointer",opacity:deleting?0.5:1 }}>Cancel</button>
                <button onClick={handleDeleteAll} disabled={deleting} style={{ flex:1,padding:"10px",borderRadius:"11px",border:"none",background:deleting?"rgba(239,68,68,0.5)":"linear-gradient(135deg,#ef4444,#f87171)",color:"white",fontSize:"13px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:deleting?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px" }}>
                  {deleting?<><i className="bi bi-arrow-repeat" style={{ animation:"spin 0.8s linear infinite",fontSize:"13px" }}/>Deleting...</>:<><i className="bi bi-trash3" style={{ fontSize:"13px" }}/>Delete All</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes checkPop  { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes modalIn   { from{opacity:0;transform:translateY(18px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes overdueFlash { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        /* ── Header ── */
        .dash-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:1.4rem; flex-wrap:wrap; gap:0.75rem; }
        .dash-date   { font-size:10.5px; font-weight:700; letter-spacing:1.1px; text-transform:uppercase; color:#94a3b8; margin-bottom:4px; }
        .dash-greeting { font-family:'Playfair Display',serif; font-size:clamp(1.3rem,4vw,2rem); font-weight:800; line-height:1.15; margin:0; }
        .dash-sub    { font-size:12.5px; margin-top:3px; }
        .dash-actions { display:flex; gap:6px; flex-wrap:wrap; align-items:center; flex-shrink:0; }

        /* ── Buttons ── */
        .btn-ghost { display:flex; align-items:center; gap:5px; padding:8px 13px; border-radius:11px; border:1.5px solid; background:transparent; font-size:12.5px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.18s; }
        .btn-danger { display:flex; align-items:center; gap:5px; padding:8px 13px; border-radius:11px; border:1.5px solid rgba(239,68,68,0.25); background:rgba(239,68,68,0.05); color:#ef4444; font-size:12.5px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.18s; }
        .btn-danger:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.5); }
        .btn-primary-grad { display:flex; align-items:center; gap:6px; padding:9px 16px; border-radius:11px; border:none; cursor:pointer; background:linear-gradient(135deg,#6366f1,#0ea5e9); color:white; font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif; box-shadow:0 5px 16px rgba(99,102,241,0.35); transition:transform 0.15s,box-shadow 0.15s; }
        .btn-primary-grad:hover { transform:translateY(-1px); box-shadow:0 8px 22px rgba(99,102,241,0.45); }
        .btn-label { display:inline; }

        /* ── Stats ── */
        .stats-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-bottom:1.4rem; }
        .stat-card  { border-radius:14px; padding:12px 14px; box-shadow:0 1px 4px rgba(0,0,0,0.05); }

        /* ── Toolbar ── */
        .toolbar { display:flex; align-items:center; gap:8px; margin-bottom:1rem; flex-wrap:wrap; }
        .search-input { width:100%; padding:8px 11px 8px 32px; border-radius:10px; font-size:12.5px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s,box-shadow 0.2s; box-sizing:border-box; }
        .pill-group { display:flex; gap:3px; padding:3px; border-radius:10px; flex-shrink:0; }
        .pill-btn  { padding:5px 11px; border-radius:7px; border:none; cursor:pointer; font-size:11.5px; font-weight:700; font-family:'DM Sans',sans-serif; transition:all 0.18s; white-space:nowrap; }
        .view-btn  { width:30px; height:30px; border-radius:7px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }

        /* ── Task grids ── */
        .task-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:12px; align-items:start; }
        .task-list { display:grid; grid-template-columns:1fr; gap:10px; }

        /* ════════════════════════════
           MOBILE  ≤ 640px
        ════════════════════════════ */
        @media (max-width: 640px) {
          .dash-header    { flex-direction:column; align-items:flex-start; gap:0.8rem; }
          .dash-actions   { width:100%; justify-content:flex-start; }
          .btn-label      { display:none; }   /* icon-only on mobile */
          .btn-ghost,
          .btn-danger     { padding:8px 10px; }
          .btn-primary-grad { padding:8px 14px; font-size:12.5px; }

          /* Stats: 2+2+1 layout */
          .stats-grid     { grid-template-columns:repeat(2,1fr); gap:7px; }
          /* Last stat (Progress) spans full width */
          .stat-card:last-child { grid-column: 1 / -1; }

          /* Toolbar: search full width, pills wrap below */
          .toolbar        { gap:6px; }
          .search-input   { font-size:12px; }

          /* Always 2 columns for cards on mobile */
          .task-grid      { grid-template-columns:repeat(2,1fr); gap:9px; }
          /* List stays 1 column */
          .task-list      { gap:8px; }
        }

        /* ════════════════════════════
           VERY SMALL  ≤ 380px
        ════════════════════════════ */
        @media (max-width: 380px) {
          .task-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}

/* ── Helpers ──────────────────────── */
function PgBtn({ children, disabled, onClick, isDark }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:"32px",height:"32px",borderRadius:"9px",border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)"}`,background:isDark?"#12121e":"#ffffff",color:isDark?"#64748b":"#64748b",cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:disabled?0.35:1,fontSize:"13px" }}>
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
  const now = new Date(), due = new Date(task.dueDate);
  if (task.status==="completed") {
    if (task.completedAt && new Date(task.completedAt)<=due) return "on-time";
    return "late";
  }
  if (due<now) return "overdue";
  return (due-now)/3600000<24 ? "due-soon" : "ok";
}

/* ── TaskCard ──────────────────────── */
function TaskCard({ task, view, isDark, onToggle, onDelete, onEdit, index }) {
  const [hovered,  setHovered]  = useState(false);
  const [toggling, setToggling] = useState(false);
  const done      = task.status === "completed";
  const dueStatus = getDueStatus(task);
  const c = (l, d) => isDark ? d : l;

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(task._id);
    setTimeout(()=>setToggling(false), 400);
  };

  const DueBadge = () => {
    if (!dueStatus || dueStatus==="ok") return null;
    const meta = {
      overdue:    { label:"Overdue",        color:"#ef4444", bg:"rgba(239,68,68,0.1)",    icon:"bi-alarm-fill",    pulse:true  },
      "due-soon": { label:"Due soon",       color:"#f59e0b", bg:"rgba(245,158,11,0.1)",   icon:"bi-alarm",         pulse:false },
      "on-time":  { label:"On time",        color:"#10b981", bg:"rgba(16,185,129,0.1)",   icon:"bi-check2-circle", pulse:false },
      late:       { label:"Late",           color:"#f87171", bg:"rgba(248,113,113,0.08)", icon:"bi-clock-history", pulse:false },
    }[dueStatus];
    if (!meta) return null;
    return (
      <span style={{ fontSize:"9.5px", fontWeight:700, padding:"2px 7px", borderRadius:"100px", background:meta.bg, color:meta.color, display:"inline-flex", alignItems:"center", gap:"3px", animation:meta.pulse?"overdueFlash 1.5s ease-in-out infinite":undefined, flexShrink:0 }}>
        <i className={`bi ${meta.icon}`} style={{ fontSize:"9px" }}/>{meta.label}
      </span>
    );
  };

  /* LIST ROW */
  if (view==="list") {
    return (
      <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", borderRadius:"13px", background:c("#ffffff","#12121e"), border:`1px solid ${hovered?"#6366f1":c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:hovered?"0 4px 14px rgba(99,102,241,0.1)":c("0 1px 3px rgba(0,0,0,0.04)","none"), transition:"all 0.2s ease", animation:"slideUp 0.3s ease both", animationDelay:`${index*35}ms` }}>
        <button onClick={handleToggle} style={{ width:"20px", height:"20px", borderRadius:"50%", flexShrink:0, cursor:"pointer", border:done?"none":`2px solid ${c("rgba(0,0,0,0.15)","rgba(255,255,255,0.15)")}`, background:done?"linear-gradient(135deg,#10b981,#34d399)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s", transform:toggling?"scale(0.85)":"scale(1)" }}>
          {done&&<i className="bi bi-check" style={{ color:"white",fontSize:"11px",animation:"checkPop 0.3s ease" }}/>}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:"13px", fontWeight:600, margin:"0 0 1px", color:done?c("#94a3b8","#4b5563"):c("#0f172a","#f1f5f9"), textDecoration:done?"line-through":"none", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{task.title}</p>
          {task.description&&<p style={{ fontSize:"11.5px", color:c("#94a3b8","#475569"), margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{task.description}</p>}
        </div>
        <DueBadge/>
        <span style={{ fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"100px", flexShrink:0, background:done?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color:done?"#10b981":"#f59e0b", display:"flex", alignItems:"center", gap:"4px" }}>
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:done?"#10b981":"#f59e0b", display:"inline-block" }}/>
          {done?"Done":"Pending"}
        </span>
        <div style={{ display:"flex", gap:"3px", opacity:hovered?1:0, transition:"opacity 0.15s" }}>
          <ABtn icon="bi-pencil" color="#6366f1" bg="rgba(99,102,241,0.1)" onClick={()=>onEdit(task)}/>
          <ABtn icon="bi-trash"  color="#ef4444" bg="rgba(239,68,68,0.1)"  onClick={()=>onDelete(task._id)}/>
        </div>
      </div>
    );
  }

  /* GRID CARD */
  const topBar = done
    ? "linear-gradient(90deg,#10b981,#34d399)"
    : dueStatus==="overdue"
      ? "linear-gradient(90deg,#ef4444,#f87171)"
      : hovered ? "linear-gradient(90deg,#6366f1,#0ea5e9,#6366f1)" : "linear-gradient(90deg,#6366f1,#0ea5e9)";

  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ borderRadius:"18px", position:"relative", overflow:"hidden", background:c("#ffffff","#12121e"), border:`1px solid ${dueStatus==="overdue"&&!done?"rgba(239,68,68,0.35)":hovered?"rgba(99,102,241,0.4)":c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:hovered?c("0 10px 28px rgba(99,102,241,0.14)","0 10px 28px rgba(99,102,241,0.1)"):c("0 1px 4px rgba(0,0,0,0.05)","none"), transition:"all 0.25s ease", animation:"slideUp 0.35s ease both", animationDelay:`${index*50}ms`, display:"flex", flexDirection:"column" }}>

      {/* Top bar */}
      <div style={{ height:"3px", flexShrink:0, background:topBar, transition:"all 0.3s", boxShadow:hovered?`0 0 7px ${done?"#10b981":dueStatus==="overdue"?"#ef4444":"rgba(99,102,241,0.55)"}`:undefined }}/>

      <div style={{ padding:"14px", display:"flex", flexDirection:"column", flex:1 }}>
        {/* Row 1: status + actions */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"5px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"9.5px", fontWeight:700, padding:"2px 8px", borderRadius:"100px", background:done?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.09)", color:done?"#10b981":"#f59e0b", display:"flex", alignItems:"center", gap:"3px" }}>
              <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:done?"#10b981":"#f59e0b", display:"inline-block" }}/>
              {done?"Done":"Pending"}
            </span>
            <DueBadge/>
          </div>
          <div style={{ display:"flex", gap:"3px", opacity:hovered?1:0, transition:"opacity 0.18s" }}>
            <ABtn icon="bi-pencil" color="#6366f1" bg="rgba(99,102,241,0.1)" onClick={()=>onEdit(task)}/>
            <ABtn icon="bi-trash"  color="#ef4444" bg="rgba(239,68,68,0.1)"  onClick={()=>onDelete(task._id)}/>
          </div>
        </div>

        {/* Title */}
        <p style={{ fontSize:"13px", fontWeight:700, margin:"0 0 6px", color:done?c("#94a3b8","#4b5563"):c("#0f172a","#f1f5f9"), textDecoration:done?"line-through":"none", lineHeight:1.4, wordBreak:"break-word" }}>
          {task.title}
        </p>

        {/* Description */}
        {task.description&&(
          <p style={{ fontSize:"11.5px", color:c("#64748b","#64748b"), margin:"0 0 10px", lineHeight:1.6, wordBreak:"break-word" }}>
            {task.description}
          </p>
        )}

        <div style={{ flex:1 }}/>

        {/* Created time */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"7px" }}>
          <i className="bi bi-calendar-event" style={{ fontSize:"9px", color:c("#cbd5e1","#334155") }}/>
          <span style={{ fontSize:"9.5px", color:c("#94a3b8","#475569") }}>{formatDateTime(task.createdAt)}</span>
        </div>

        {/* Due date */}
        {task.dueDate&&(
          <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"10px", padding:"5px 8px", borderRadius:"8px", background:dueStatus==="overdue"&&!done?"rgba(239,68,68,0.06)":c("rgba(0,0,0,0.025)","rgba(255,255,255,0.03)") }}>
            <i className="bi bi-flag-fill" style={{ fontSize:"9px", color:dueStatus==="overdue"&&!done?"#ef4444":dueStatus==="due-soon"?"#f59e0b":c("#94a3b8","#475569"), flexShrink:0 }}/>
            <span style={{ fontSize:"9.5px", fontWeight:600, color:dueStatus==="overdue"&&!done?"#ef4444":dueStatus==="due-soon"?"#f59e0b":c("#64748b","#64748b"), lineHeight:1.3 }}>
              {new Date(task.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})} {new Date(task.dueDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={{ height:"1px", background:c("rgba(0,0,0,0.05)","rgba(255,255,255,0.05)"), marginBottom:"10px" }}/>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={handleToggle} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"4px 10px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:700, transition:"all 0.2s", background:done?"rgba(16,185,129,0.1)":"rgba(99,102,241,0.08)", color:done?"#10b981":"#6366f1", transform:toggling?"scale(0.93)":"scale(1)" }}>
            <div style={{ width:"14px", height:"14px", borderRadius:"50%", border:done?"none":`1.5px solid ${c("rgba(0,0,0,0.15)","rgba(255,255,255,0.2)")}`, background:done?"linear-gradient(135deg,#10b981,#34d399)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {done&&<i className="bi bi-check" style={{ color:"white",fontSize:"8px" }}/>}
            </div>
            {done?"Done":"Mark done"}
          </button>
          <span style={{ fontSize:"10px", color:c("#94a3b8","#475569"), display:"flex", alignItems:"center", gap:"3px" }}>
            <i className="bi bi-clock" style={{ fontSize:"9px" }}/>
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
      style={{ width:"24px", height:"24px", borderRadius:"7px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:h?bg:"transparent", color, fontSize:"11px", transition:"all 0.15s" }}>
      <i className={`bi ${icon}`}/>
    </button>
  );
}