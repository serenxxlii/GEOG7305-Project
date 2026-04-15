import React, { useState, useRef } from "react";

export default function FilterPanel({ config, onFilter }) {
  const [pos, setPos] = useState({ x: 60, y: 20 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (e) => { dragging.current = true; offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }; };
  const onDrag = (e) => { if (!dragging.current) return; setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }); };
  const endDrag = () => { dragging.current = false; };

  const [income, setIncome] = useState(config?.income || 30000);
  const [maxAi, setMaxAi] = useState(config?.maxNormAi ?? 1.0);

  const handleApplyIncome = () => onFilter({ income: Number(income), maxNormAi: maxAi });
  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setMaxAi(value);
    onFilter({ income: Number(income), maxNormAi: value });
  };

  const isSimulating = config?.isSimulating || false;
  // 🌟 修复：直接读取 App.jsx 中的 nextTuition 和 nextCapacity
  const simTuition = config?.nextTuition || 100000;
  const simCapacity = config?.nextCapacity || 800;

  const stopEvent = (e) => e.stopPropagation();

  return (
    <div 
      className="glass-effect"
      onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
      style={{ position: "absolute", left: pos.x, top: pos.y, zIndex: 2000, width: "350px", cursor: "default" }}
    >
      <div onMouseDown={startDrag} style={{ padding: "10px", background: "rgba(0,0,0,0.05)", cursor: "move", borderRadius: "12px 12px 0 0", fontSize: "12px", textAlign: "center", color: "#666", fontWeight: "500" }}>⠿ Drag to move panel</div>

      <div style={{ padding: "15px 20px" }} onMouseDown={stopEvent} onWheel={stopEvent} onDoubleClick={stopEvent}>
        <h4 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "600" }}>🔍 Control Center</h4>

        {/* 图层开关 */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", paddingBottom: "15px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <label style={{ fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><input type="checkbox" checked={config?.showRaster ?? true} onChange={(e) => onFilter({ showRaster: e.target.checked })} style={{ accentColor: "#2A2A2A" }}/> Equity Map</label>
          <label style={{ fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><input type="checkbox" checked={config?.showSchools ?? true} onChange={(e) => onFilter({ showSchools: e.target.checked })} style={{ accentColor: "#2A2A2A" }}/> International Schools</label>
          <label style={{ fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><input type="checkbox" checked={config?.showDemand ?? true} onChange={(e) => onFilter({ showDemand: e.target.checked })} style={{ accentColor: "#2A2A2A" }}/> Demand Points</label>

        </div>

        {/* 收入与公平性筛选 */}
        <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "8px" }}>Min. Monthly Household Income (HKD):</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)", outline: "none", fontSize: "13px" }}/>
            <button onClick={handleApplyIncome} style={{ padding: "6px 14px", background: "#2A2A2A", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Apply</button>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span style={{ fontSize: "13px", color: "#555" }}>Max Spatial Equity Score (Ai):</span><span style={{ fontSize: "14px", fontWeight: "bold", color: "#d73027" }}>{maxAi.toFixed(2)}</span></div>
          <input type="range" min="0" max="1" step="0.01" value={maxAi} onChange={handleSliderChange} style={{ width: "100%", cursor: "pointer", accentColor: "#d73027" }}/>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999", marginTop: "4px" }}><span>0 (Disadvantaged)</span><span>1.0 (Show All)</span></div>
        </div>
        
        {/* 沙盘推演模块 */}
<div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", color: "#007AFF" }}>⚡ Sandbox Simulation</h4>
            <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={isSimulating}
                onChange={(e) => onFilter({ isSimulating: e.target.checked, simSchools: [] })}
              />
              Enable Simulation
            </label>
          </div>

          {isSimulating && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* 🟦 上块：负担比 (Tuition Burden) */}
              <div style={{ background: "rgba(0,122,255,0.06)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,122,255,0.15)" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#333", marginBottom: "10px" }}>
                  ⚖️ Tuition Burden (Policy)
                </div>
                
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "11px", color: "#555", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Frictionless Threshold:</span>
                    <span style={{ fontWeight: "600", color: "#007AFF" }}>{config.wijLower.toFixed(2)}</span>
                  </label>
                  <input type="range" min="0.05" max="0.30" step="0.01" value={config.wijLower} 
                    onChange={(e) => onFilter({ wijLower: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "#007AFF", cursor: "pointer" }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#555", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Absolute Friction Threshold:</span>
                    <span style={{ fontWeight: "600", color: "#007AFF" }}>{config.wijUpper.toFixed(2)}</span>
                  </label>
                  <input type="range" min="0.35" max="0.80" step="0.01" value={config.wijUpper} 
                    onChange={(e) => onFilter({ wijUpper: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "#007AFF", cursor: "pointer" }} 
                  />
                </div>
              </div>

              {/* 🟦 下块：学校参数 (Facility Management) */}
              <div style={{ background: "rgba(0,122,255,0.06)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,122,255,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>
                    🏗️ Facility Params
                  </div>
                  <div style={{ fontSize: "11px", color: "#555" }}>
                    Deployed: <span style={{ fontWeight: "600", color: "#007AFF" }}>{config.simSchools?.length || 0}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "9px", color: "#007AFF", background: "rgba(0,122,255,0.15)", padding: "3px 6px", borderRadius: "4px" }}>
                    Click map to apply
                  </span>
                  <button 
                    onClick={() => onFilter({ simSchools: [] })} 
                    style={{ color: "#d73027", border: "none", background: "none", cursor: "pointer", fontSize: "11px", padding: 0, textDecoration: "underline" }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "11px", color: "#555", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Simulated Tuition (HKD):</span>
                    <span style={{ fontWeight: "600", color: "#007AFF" }}>${config.nextTuition.toLocaleString()}</span>
                  </label>
                  <input type="range" min="100000" max="300000" step="5000" value={config.nextTuition} 
                    onChange={(e) => onFilter({ nextTuition: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "#007AFF", cursor: "pointer" }} 
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11px", color: "#555", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Simulated Capacity:</span>
                    <span style={{ fontWeight: "600", color: "#007AFF" }}>{config.nextCapacity.toLocaleString()}</span>
                  </label>
                  <input type="range" min="800" max="2000" step="100" value={config.nextCapacity} 
                    onChange={(e) => onFilter({ nextCapacity: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "#007AFF", cursor: "pointer" }} 
                  />
                </div>

                {/* 备注移到底部，使其不干扰操作流 */}
                <div style={{ fontSize: "9px", color: "#777", fontStyle: "italic", padding: "6px", background: "rgba(0,0,0,0.04)", borderRadius: "4px", lineHeight: "1.3", borderLeft: "2px solid #ccc" }}>
                  Note: Simulation utilizes Euclidean Distance. Given HK's complex topography, results serve as macro-potential assessments.
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}