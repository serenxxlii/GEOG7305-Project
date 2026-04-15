import React, { useState, useRef } from "react";

export default function Legend() {
  // ==========================================
  // 1. 拖动逻辑（默认位置在左下角）
  // ==========================================
  const [pos, setPos] = useState({ x: 60, y: 500 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const onDrag = (e) => {
    if (!dragging.current) return;
    setPos({ 
      x: e.clientX - offset.current.x, 
      y: e.clientY - offset.current.y 
    });
  };

  const endDrag = () => { dragging.current = false; };

  // 阻止地图穿透
  const stopEvent = (e) => e.stopPropagation();

  return (
    <div 
      className="glass-effect"
      onMouseMove={onDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      style={{
        position: "absolute", 
        left: pos.x, 
        top: pos.y,
        zIndex: 2000, 
        width: "350px",
        /* 玻璃材质定义 */
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        cursor: "default",
        userSelect: "none"
      }}
    >
      {/* 拖动手柄 */}
      <div 
        onMouseDown={startDrag}
        style={{ 
          padding: "8px", 
          background: "rgba(0,0,0,0.03)", 
          cursor: "move", 
          borderRadius: "16px 16px 0 0",
          fontSize: "10px", 
          textAlign: "center", 
          color: "#999",
          letterSpacing: "2px"
        }}
      > ⠿ LEGEND </div>

      <div style={{ padding: "15px 20px" }} onMouseDown={stopEvent}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#333" }}>
          Spatial Equity Score (Norm_Ai)
        </h4>

        {/* 核心色带 */}
        <div style={{
          width: "100%",
          height: "12px",
          background: "linear-gradient(to right, #d73027, #fee08b, #1a9850)",
          borderRadius: "6px",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "10px"
        }}></div>

        {/* 刻度标注 */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
          <div style={{ textAlign: "left" }}>
            <span style={{ display: "block", color: "#d73027", fontWeight: "bold" }}>0.00</span>
            <span>(Highly Disadvantaged)</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ display: "block", color: "#1a9850", fontWeight: "bold" }}>0.998</span>
            <span>(Highly Privileged)</span>
          </div>
        </div>

        {/* 补充说明：针对你设计的 Modern Dot 视觉引导 */}
        <div style={{ marginTop: "15px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="modern-dot" style={{ width: "10px", height: "10px", background: "#fff" }}>
             <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#666" }}></div>
          </div>
          <span style={{ fontSize: "11px", color: "#888" }}>Solid dots represent demand point grids</span>
        </div>
        
        <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px" }}>🏫</span>
          <span style={{ fontSize: "11px", color: "#888" }}>Emojis represent school supply points</span>
        </div>
      </div>
    </div>
  );
}