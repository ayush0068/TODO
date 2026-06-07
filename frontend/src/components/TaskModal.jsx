import { useState, useEffect } from "react";

export default function TaskModal({ open, onClose, onSave, task, isDark }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [status,      setStatus]      = useState("pending");
  const [dueDate,     setDueDate]     = useState("");
  const [dueTime,     setDueTime]     = useState("");
  const [errors,      setErrors]      = useState({});

  const c = (l, d) => isDark ? d : l;

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "pending");
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        setDueDate(d.toISOString().split("T")[0]);
        setDueTime(d.toTimeString().slice(0,5));
      } else {
        setDueDate(""); setDueTime("");
      }
    } else {
      setTitle(""); setDescription(""); setStatus("pending"); setDueDate(""); setDueTime("");
    }
    setErrors({});
  }, [task, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (title.trim().length > 100) e.title = "Max 100 characters.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    let dueDateISO = null;
    if (dueDate) {
      const combined = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:00`;
      dueDateISO = new Date(combined).toISOString();
    }
    onSave({ title: title.trim(), description: description.trim(), status, dueDate: dueDateISO });
    onClose();
  };

  const inp = (extra={}) => ({
    width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:"11px",
    border:`1.5px solid ${c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)")}`,
    background:c("#f8fafc","#0d0d18"), color:c("#0f172a","#f1f5f9"),
    fontSize:"13px", fontFamily:"'DM Sans',sans-serif", outline:"none",
    transition:"border-color 0.2s,box-shadow 0.2s", ...extra,
  });
  const onF = (e)=>{e.target.style.borderColor="#6366f1";e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)";};
  const onB = (e)=>{e.target.style.borderColor=c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)");e.target.style.boxShadow="none";};
  const lbl = { display:"block", fontSize:"10.5px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:c("#64748b","#475569"), marginBottom:"7px" };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:c("#ffffff","#12121e"), borderRadius:"22px", width:"100%", maxWidth:"460px", border:`1px solid ${c("rgba(0,0,0,0.06)","rgba(255,255,255,0.05)")}`, boxShadow:"0 28px 72px rgba(0,0,0,0.22)", overflow:"hidden", fontFamily:"'DM Sans',sans-serif", animation:"modalIn 0.28s ease both" }}>

        {/* Top bar */}
        <div style={{ height:"3px", background:"linear-gradient(90deg,#6366f1,#0ea5e9)" }}/>

        <div style={{ padding:"22px 24px 26px" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"22px" }}>
            <div>
              <p style={{ fontSize:"10px", fontWeight:700, letterSpacing:"1.1px", textTransform:"uppercase", color:"#6366f1", margin:"0 0 4px" }}>
                {task?"Edit Task":"New Task"}
              </p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:800, color:c("#0f172a","#f1f5f9"), margin:0, lineHeight:1.2 }}>
                {task?"Update your task":"What needs to be done?"}
              </h2>
            </div>
            <button onClick={onClose} style={{ width:"30px", height:"30px", borderRadius:"9px", border:`1.5px solid ${c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)")}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:c("#94a3b8","#475569"), fontSize:"13px" }}>
              <i className="bi bi-x-lg"/>
            </button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {/* Title */}
            <div>
              <label style={lbl}>Title <span style={{ color:"#ef4444" }}>*</span></label>
              <input style={inp({ borderColor: errors.title?"#ef4444":undefined })} placeholder="What needs to be done?" value={title} maxLength={100}
                onChange={e=>{setTitle(e.target.value);setErrors({});}} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&handleSubmit()} onFocus={onF} onBlur={onB} autoFocus/>
              {errors.title&&<p style={{ fontSize:"11.5px", color:"#ef4444", margin:"5px 0 0" }}>{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description <span style={{ fontSize:"10px", fontWeight:500, textTransform:"none" }}>(optional)</span></label>
              <textarea style={{ ...inp(), resize:"none" }} rows={3} placeholder="Add more details..." value={description} maxLength={500}
                onChange={e=>setDescription(e.target.value)} onFocus={onF} onBlur={onB}/>
              <p style={{ textAlign:"right", fontSize:"11px", color:c("#94a3b8","#475569"), margin:"3px 0 0" }}>{description.length}/500</p>
            </div>

            {/* Due date + time */}
            <div>
              <label style={lbl}>
                <i className="bi bi-flag-fill" style={{ color:"#6366f1", marginRight:"5px" }}/>
                Target Completion
              </label>
              <div style={{ display:"flex", gap:"8px" }}>
                <input type="date" style={{ ...inp(), flex:1 }} value={dueDate} onChange={e=>setDueDate(e.target.value)} onFocus={onF} onBlur={onB}
                  min={new Date().toISOString().split("T")[0]}/>
                <input type="time" style={{ ...inp(), width:"130px", flexShrink:0 }} value={dueTime} onChange={e=>setDueTime(e.target.value)} onFocus={onF} onBlur={onB}/>
              </div>
              {dueDate&&(
                <p style={{ fontSize:"11px", color:c("#94a3b8","#475569"), margin:"5px 0 0", display:"flex", alignItems:"center", gap:"4px" }}>
                  <i className="bi bi-info-circle" style={{ fontSize:"10px" }}/>
                  Task will be marked overdue if not completed by this time.
                </p>
              )}
              {dueDate&&(
                <button onClick={()=>{setDueDate("");setDueTime("");}} style={{ fontSize:"11px", color:"#ef4444", background:"none", border:"none", cursor:"pointer", padding:"4px 0 0", display:"flex", alignItems:"center", gap:"4px" }}>
                  <i className="bi bi-x-circle" style={{ fontSize:"10px" }}/>Clear due date
                </button>
              )}
            </div>

            {/* Status — edit only */}
            {task&&(
              <div>
                <label style={lbl}>Status</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  {[
                    { val:"pending",   label:"Pending",   color:"#f59e0b", ab:"rgba(245,158,11,0.4)", bg:"rgba(245,158,11,0.1)" },
                    { val:"completed", label:"Completed", color:"#10b981", ab:"rgba(16,185,129,0.4)", bg:"rgba(16,185,129,0.1)" },
                  ].map(s=>{
                    const active=status===s.val;
                    return (
                      <button key={s.val} onClick={()=>setStatus(s.val)} style={{ flex:1, padding:"9px 12px", borderRadius:"10px", border:`1.5px solid ${active?s.ab:c("rgba(0,0,0,0.08)","rgba(255,255,255,0.08)")}`, background:active?s.bg:"transparent", color:active?s.color:c("#94a3b8","#475569"), fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.18s", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                        <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:active?s.color:c("#d1d5db","#4b5563"), display:"inline-block" }}/>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:"9px", marginTop:"22px" }}>
            <button onClick={onClose} style={{ flex:1, padding:"11px", borderRadius:"12px", border:`1.5px solid ${c("rgba(0,0,0,0.09)","rgba(255,255,255,0.08)")}`, background:"transparent", color:c("#64748b","#64748b"), fontSize:"13px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={{ flex:1, padding:"11px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", color:"white", fontSize:"13px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", boxShadow:"0 5px 16px rgba(99,102,241,0.3)", transition:"transform 0.15s,box-shadow 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(99,102,241,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 5px 16px rgba(99,102,241,0.3)";}}>
              {task?"Save Changes":"Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}