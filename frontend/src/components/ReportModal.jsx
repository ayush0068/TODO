import { useState } from "react";

function getDueStatus(task) {
  if (!task.dueDate) return null;
  const now = new Date(), due = new Date(task.dueDate);
  if (task.status==="completed") {
    const completedAt = new Date(task.completedAt);
    return completedAt <= due ? "on-time" : "late";
  }
  if (due < now) return "overdue";
  const hoursDiff = (due - now) / 3600000;
  return hoursDiff < 24 ? "due-soon" : "ok";
}

function minsLate(task) {
  if (!task.dueDate || task.status!=="completed" || !task.completedAt) return null;
  const diff = new Date(task.completedAt) - new Date(task.dueDate);
  return diff > 0 ? Math.round(diff/60000) : null;
}

function fmtDur(mins) {
  if (mins < 60) return `${mins}m late`;
  const h = Math.floor(mins/60), m = mins%60;
  return `${h}h${m ? ` ${m}m` : ""} late`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}

function fmtDateTime(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"}) + " " + dt.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
}

export default function ReportModal({ open, onClose, tasks, isDark, user }) {
  const [tab, setTab] = useState("overview");
  const c = (l,d) => isDark ? d : l;

  if (!open) return null;

  const total     = tasks.length;
  const done      = tasks.filter(t=>t.status==="completed").length;
  const pending   = total - done;
  
  // Calculate dynamic completion percentage
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  
  const overdue   = tasks.filter(t=>getDueStatus(t)==="overdue");
  const lateComp  = tasks.filter(t=>getDueStatus(t)==="late");
  const onTime    = tasks.filter(t=>getDueStatus(t)==="on-time");
  const withDue   = tasks.filter(t=>t.dueDate);
  const noDueTasks = tasks.filter(t=>!t.dueDate);
  const completedWithDue = tasks.filter(t=>t.status==="completed" && t.dueDate);
  
  // avg completion time (in hours) from created to completed
  const compTasks = tasks.filter(t=>t.status==="completed" && t.completedAt);
  const avgCompH  = compTasks.length > 0
    ? Math.round(compTasks.reduce((s,t)=>(s+(new Date(t.completedAt)-new Date(t.createdAt))),0)/compTasks.length/3600000)
    : null;

  // oldest pending
  const oldestPending = tasks.filter(t=>t.status==="pending").sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))[0];

  // Dynamic scoring system
  let score = 0;
  let maxScore = 100;
  
  if (total > 0) {
    // 1. Completion Rate (max 50 points)
    const completionScore = (done / total) * 50;
    score += completionScore;
    
    // 2. On-time performance (max 30 points) - only for tasks with due dates
    if (withDue.length > 0) {
      const onTimeRate = onTime.length / withDue.length;
      const onTimeScore = onTimeRate * 30;
      score += onTimeScore;
    } else if (noDueTasks.length > 0 && total > 0) {
      // If no due dates, allocate points based on completion
      score += 15;
    }
    
    // 3. Penalty for overdue tasks (max -15 points)
    const overduePenalty = Math.min(15, overdue.length * 3);
    score -= overduePenalty;
    
    // 4. Penalty for late completions (max -10 points)
    const latePenalty = Math.min(10, lateComp.length * 2);
    score -= latePenalty;
    
    // 5. Bonus for perfect record (max +5 points)
    if (done === total && overdue.length === 0 && lateComp.length === 0) {
      score += 5;
    }
    
    // 6. Early completion bonus (max +5 points)
    if (compTasks.length > 0) {
      const earlyCompletions = compTasks.filter(t => {
        if (!t.dueDate) return false;
        const completedAt = new Date(t.completedAt);
        const dueDate = new Date(t.dueDate);
        const hoursEarly = (dueDate - completedAt) / 3600000;
        return hoursEarly > 24; // Completed more than 24 hours early
      }).length;
      const earlyBonus = Math.min(5, Math.floor(earlyCompletions * 1.5));
      score += earlyBonus;
    }
    
    // Ensure score stays within 0-100 range
    score = Math.max(0, Math.min(100, Math.round(score)));
  }

  const scoreColor = score >= 85 ? "#10b981" : score >= 70 ? "#34d399" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444";
  const scoreLabel = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Needs Work" : "Critical";

  const tabs = ["overview","timeline","issues"];

  const sCard = (label,val,icon,color,bg,sub) => (
    <div style={{ borderRadius:"14px", padding:"16px", background:c("#f8fafc","#0d0d18"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
        <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", color:c("#94a3b8","#475569") }}>{label}</span>
        <div style={{ width:"28px", height:"28px", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", background:bg }}>
          <i className={`bi ${icon}`} style={{ color, fontSize:"13px" }}/>
        </div>
      </div>
      <p style={{ fontSize:"20px", fontWeight:800, fontFamily:"'Playfair Display',serif", color:c("#0f172a","#f1f5f9"), margin:"0 0 2px" }}>{val}</p>
      {sub && <p style={{ fontSize:"11px", color:c("#94a3b8","#475569"), margin:0 }}>{sub}</p>}
    </div>
  );

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:c("#ffffff","#12121e"), borderRadius:"22px", width:"100%", maxWidth:"580px", maxHeight:"88dvh", overflow:"hidden", display:"flex", flexDirection:"column", border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:"0 32px 80px rgba(0,0,0,0.25)", fontFamily:"'DM Sans',sans-serif", animation:"modalIn 0.28s ease both" }}>

        {/* Top bar */}
        <div style={{ height:"3px", flexShrink:0, background:"linear-gradient(90deg,#6366f1,#0ea5e9,#10b981)" }}/>

        {/* Header */}
        <div style={{ padding:"20px 24px 0", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px" }}>
            <div>
              <p style={{ fontSize:"10px", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color:"#6366f1", margin:"0 0 3px" }}>Productivity Report</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:800, color:c("#0f172a","#f1f5f9"), margin:0 }}>
                {user?.name?.split(" ")[0] || "Your"}'s Report
              </h2>
              <p style={{ fontSize:"11.5px", color:c("#94a3b8","#475569"), margin:"3px 0 0" }}>
                Generated {fmtDate(new Date())}
              </p>
            </div>
            {/* Score ring */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
              <div style={{ width:"58px", height:"58px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:`conic-gradient(${scoreColor} ${score*3.6}deg, ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.07)")} 0deg)`, position:"relative" }}>
                <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:c("#ffffff","#12121e"), display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:"14px", fontWeight:800, color:scoreColor }}>{score}</span>
                </div>
              </div>
              <span style={{ fontSize:"10px", fontWeight:700, color:scoreColor }}>{scoreLabel}</span>
            </div>

            <button onClick={onClose} style={{ width:"30px", height:"30px", borderRadius:"9px", border:`1.5px solid ${c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)")}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:c("#94a3b8","#475569"), fontSize:"13px", flexShrink:0 }}>
              <i className="bi bi-x-lg"/>
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:"4px", padding:"3px", borderRadius:"11px", background:c("rgba(0,0,0,0.04)","rgba(255,255,255,0.04)"), border:`1px solid ${c("rgba(0,0,0,0.07)","rgba(255,255,255,0.07)")}`, marginBottom:"16px" }}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"7px 12px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", transition:"all 0.18s", background:tab===t?"linear-gradient(135deg,#6366f1,#0ea5e9)":"transparent", color:tab===t?"white":c("#64748b","#64748b"), boxShadow:tab===t?"0 2px 8px rgba(99,102,241,0.28)":"none" }}>
                {t==="overview"?"Overview":t==="timeline"?"Timeline":"Issues"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 24px 24px" }}>

          {/* OVERVIEW */}
          {tab==="overview" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px" }}>
                {sCard("Total Tasks", total, "bi-collection", "#6366f1", c("rgba(99,102,241,0.07)","rgba(99,102,241,0.12)"))}
                {sCard("Completed", done, "bi-check-circle-fill", "#10b981", c("rgba(16,185,129,0.07)","rgba(16,185,129,0.12)"), `${completionRate}% of total`)}
                {sCard("Pending", pending, "bi-hourglass-split", "#f59e0b", c("rgba(245,158,11,0.07)","rgba(245,158,11,0.12)"), oldestPending ? `Oldest: ${fmtDate(oldestPending.createdAt)}` : undefined)}
                {sCard("Avg. Completion", avgCompH != null ? `${avgCompH}h` : "—", "bi-stopwatch", "#0ea5e9", c("rgba(14,165,233,0.07)","rgba(14,165,233,0.12)"), avgCompH != null ? "from creation to done" : undefined)}
              </div>

              {/* Progress bar */}
              <div style={{ padding:"16px", borderRadius:"14px", background:c("#f8fafc","#0d0d18"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                  <span style={{ fontSize:"12px", fontWeight:700, color:c("#0f172a","#f1f5f9") }}>Overall Progress</span>
                  <span style={{ fontSize:"12px", fontWeight:800, color:"#6366f1" }}>{completionRate}%</span>
                </div>
                <div style={{ height:"8px", borderRadius:"10px", background:c("rgba(0,0,0,0.06)","rgba(255,255,255,0.06)") }}>
                  <div style={{ height:"100%", width:`${completionRate}%`, borderRadius:"10px", background:"linear-gradient(90deg,#6366f1,#0ea5e9)", transition:"width 0.6s ease" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"8px" }}>
                  <span style={{ fontSize:"11px", color:"#10b981", fontWeight:600 }}>{done} completed</span>
                  <span style={{ fontSize:"11px", color:"#f59e0b", fontWeight:600 }}>{pending} remaining</span>
                </div>
              </div>

              {/* Due date stats */}
              {withDue.length > 0 && (
                <div style={{ padding:"16px", borderRadius:"14px", background:c("#f8fafc","#0d0d18"), border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}` }}>
                  <p style={{ fontSize:"12px", fontWeight:700, color:c("#0f172a","#f1f5f9"), margin:"0 0 12px" }}>Deadline Performance</p>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[
                      { label:"On Time",  val:onTime.length,   color:"#10b981", bg:"rgba(16,185,129,0.1)" },
                      { label:"Late",     val:lateComp.length, color:"#f87171", bg:"rgba(248,113,113,0.1)" },
                      { label:"Overdue",  val:overdue.length,  color:"#ef4444", bg:"rgba(239,68,68,0.1)" },
                    ].map(s=>(
                      <div key={s.label} style={{ flex:1, padding:"10px", borderRadius:"10px", background:s.bg, textAlign:"center" }}>
                        <p style={{ fontSize:"18px", fontWeight:800, fontFamily:"'Playfair Display',serif", color:s.color, margin:"0 0 2px" }}>{s.val}</p>
                        <p style={{ fontSize:"10px", fontWeight:700, color:s.color, margin:0 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:"12px", padding:"8px", borderRadius:"8px", background:c("rgba(99,102,241,0.05)","rgba(99,102,241,0.08)") }}>
                    <p style={{ fontSize:"11px", color:c("#64748b","#94a3b8"), margin:0, textAlign:"center" }}>
                      On-time rate: {withDue.length > 0 ? Math.round((onTime.length / withDue.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              )}
              
              {/* Insight message */}
              {total > 0 && (
                <div style={{ padding:"12px 16px", borderRadius:"12px", background:score >= 70 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", border:`1px solid ${score >= 70 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <i className={`bi ${score >= 70 ? "bi-emoji-smile" : "bi-emoji-neutral"}`} style={{ color:score >= 70 ? "#10b981" : "#f59e0b", fontSize:"16px" }}/>
                    <p style={{ fontSize:"12px", color:c("#0f172a","#f1f5f9"), margin:0 }}>
                      {score >= 85 && "Outstanding! You're crushing your goals! 🎉"}
                      {score >= 70 && score < 85 && "Great work! Keep up the momentum! 💪"}
                      {score >= 50 && score < 70 && "Good progress! A little more focus on deadlines will help 📈"}
                      {score >= 30 && score < 50 && "Room for improvement. Try to prioritize tasks better 📋"}
                      {score < 30 && "Time to reset! Focus on completing pending tasks ASAP ⚠️"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIMELINE */}
          {tab==="timeline" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {tasks.length===0 && <p style={{ textAlign:"center", color:c("#94a3b8","#475569"), fontSize:"13px", padding:"2rem 0" }}>No tasks yet.</p>}
              {[...tasks].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(task=>{
                const ds = getDueStatus(task);
                const done = task.status==="completed";
                const late = minsLate(task);
                return (
                  <div key={task._id} style={{ display:"flex", gap:"12px", padding:"12px 14px", borderRadius:"13px", background:c("#f8fafc","#0d0d18"), border:`1px solid ${c("rgba(0,0,0,0.05)","rgba(255,255,255,0.04)")}` }}>
                    {/* dot */}
                    <div style={{ paddingTop:"3px", flexShrink:0 }}>
                      <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:done ? "#10b981" : ds==="overdue" ? "#ef4444" : ds==="due-soon" ? "#f59e0b" : "#6366f1" }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px" }}>
                        <p style={{ fontSize:"13px", fontWeight:700, color:c("#0f172a","#f1f5f9"), margin:0, textDecoration:done?"line-through":"none", opacity:done?0.6:1 }}>{task.title}</p>
                        {ds && ds!=="ok" && (
                          <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:"100px", flexShrink:0,
                            background:{overdue:"rgba(239,68,68,0.1)","on-time":"rgba(16,185,129,0.1)",late:"rgba(248,113,113,0.1)","due-soon":"rgba(245,158,11,0.1)"}[ds],
                            color:{overdue:"#ef4444","on-time":"#10b981",late:"#f87171","due-soon":"#f59e0b"}[ds] }}>
                            {ds==="on-time" ? "On time" : ds==="overdue" ? "Overdue" : ds==="late" ? "Late" : ds==="due-soon" ? "Due soon" : ""}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:"11px", color:c("#94a3b8","#475569"), margin:"3px 0 0" }}>
                        Created {fmtDateTime(task.createdAt)}
                        {task.dueDate && <span style={{ marginLeft:"8px", color:ds==="overdue"?"#ef4444":ds==="late"?"#f87171":c("#94a3b8","#475569") }}>· Due {fmtDateTime(task.dueDate)}</span>}
                        {done && task.completedAt && <span style={{ marginLeft:"8px", color:"#10b981" }}>· Done {fmtDateTime(task.completedAt)}</span>}
                        {late && <span style={{ marginLeft:"8px", color:"#f87171", fontWeight:700 }}>· {fmtDur(late)}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ISSUES */}
          {tab==="issues" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {overdue.length===0 && lateComp.length===0 && pending===0 && (
                <div style={{ textAlign:"center", padding:"2.5rem 1rem" }}>
                  <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:c("rgba(16,185,129,0.07)","rgba(16,185,129,0.12)"), display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                    <i className="bi bi-check2-all" style={{ fontSize:"22px", color:"#10b981" }}/>
                  </div>
                  <p style={{ fontWeight:700, fontSize:"14px", color:c("#0f172a","#f1f5f9"), margin:"0 0 5px" }}>No issues found</p>
                  <p style={{ fontSize:"12px", color:c("#94a3b8","#475569"), margin:0 }}>Great job staying on top of everything!</p>
                </div>
              )}

              {overdue.length > 0 && (
                <div>
                  <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", color:"#ef4444", margin:"0 0 8px", display:"flex", alignItems:"center", gap:"5px" }}>
                    <i className="bi bi-exclamation-triangle-fill"/>Overdue Tasks ({overdue.length})
                  </p>
                  {overdue.map(t=>{
                    const overH = Math.round((new Date() - new Date(t.dueDate))/3600000);
                    return (
                      <div key={t._id} style={{ padding:"12px 14px", borderRadius:"12px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)", marginBottom:"6px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
                          <i className="bi bi-alarm-fill" style={{ color:"#ef4444", fontSize:"12px" }}/>
                          <p style={{ fontSize:"13px", fontWeight:700, color:c("#0f172a","#f1f5f9"), margin:0 }}>{t.title}</p>
                        </div>
                        <p style={{ fontSize:"11px", color:"#ef4444", margin:0, fontWeight:600 }}>
                          Was due {fmtDateTime(t.dueDate)} · {overH}h overdue
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {lateComp.length > 0 && (
                <div>
                  <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", color:"#f87171", margin:"0 0 8px", display:"flex", alignItems:"center", gap:"5px" }}>
                    <i className="bi bi-clock-history"/>Completed Late ({lateComp.length})
                  </p>
                  {lateComp.map(t=>{
                    const late=minsLate(t);
                    return (
                      <div key={t._id} style={{ padding:"12px 14px", borderRadius:"12px", background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.15)", marginBottom:"6px" }}>
                        <p style={{ fontSize:"13px", fontWeight:700, color:c("#0f172a","#f1f5f9"), margin:"0 0 3px", textDecoration:"line-through", opacity:0.7 }}>{t.title}</p>
                        <p style={{ fontSize:"11px", color:"#f87171", margin:0, fontWeight:600 }}>
                          {late ? fmtDur(late) : "Completed after deadline"} · Done {fmtDateTime(t.completedAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {pending > 0 && (
                <div>
                  <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", color:"#f59e0b", margin:"0 0 8px", display:"flex", alignItems:"center", gap:"5px" }}>
                    <i className="bi bi-hourglass-split"/>Still Pending ({pending})
                  </p>
                  {tasks.filter(t=>t.status==="pending").sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).slice(0, 5).map(t=>{
                    const ageH = Math.round((new Date() - new Date(t.createdAt))/3600000);
                    return (
                      <div key={t._id} style={{ padding:"12px 14px", borderRadius:"12px", background:c("rgba(245,158,11,0.05)","rgba(245,158,11,0.07)"), border:"1px solid rgba(245,158,11,0.15)", marginBottom:"6px" }}>
                        <p style={{ fontSize:"13px", fontWeight:700, color:c("#0f172a","#f1f5f9"), margin:"0 0 3px" }}>{t.title}</p>
                        <p style={{ fontSize:"11px", color:"#f59e0b", margin:0, fontWeight:600 }}>
                          Created {fmtDateTime(t.createdAt)} · {ageH}h old
                          {t.dueDate && <span style={{ color: getDueStatus(t)==="overdue"?"#ef4444":"inherit" }}> · Due {fmtDateTime(t.dueDate)}</span>}
                        </p>
                      </div>
                    );
                  })}
                  {tasks.filter(t=>t.status==="pending").length > 5 && (
                    <p style={{ fontSize:"11px", color:c("#94a3b8","#475569"), textAlign:"center", marginTop:"5px" }}>
                      +{tasks.filter(t=>t.status==="pending").length - 5} more pending tasks
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}