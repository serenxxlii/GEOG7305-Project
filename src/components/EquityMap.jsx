import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import demandData from "../data/Demand_Points.json";
import schoolData from "../data/schools.json";
import { runSandboxSimulation } from "../utils/2SFAEngine"; 

// --- 图标定义 ---
const createModernIcon = (color, isSimulated) => L.divIcon({
  className: "custom-marker",
  html: `<div class="modern-dot" style="width:12px; height:12px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: ${isSimulated ? '0 0 8px 2px gold' : '0 2px 5px rgba(0,0,0,0.3)'};"><div style="width:70%; height:70%; border-radius:50%; background:${color};"></div></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const schoolIcon = L.divIcon({
  className: "school-div-icon",
  html: `<div style="font-size:22px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🏫</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const simSchoolIcon = L.divIcon({
  className: "sim-school-icon",
  html: `<div style="font-size:24px; filter:drop-shadow(0 0 10px #007AFF);">🏫✨</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const getColor = (v) => {
  if (v < 0.3) return "#d73027";
  if (v < 0.6) return "#fee08b";
  return "#1a9850";
};

// --- 地图点击事件捕获组件 ---
function MapClickHandler({ isSimulating, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isSimulating && onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// 🌟 注意：这里接收从 App.jsx 传下来的 onMapClick 函数
export default function EquityMap({ filters, onMapClick }) {
  const { 
    income = 0, maxNormAi = 1, 
    showRaster = true, showDemand = true, showSchools = true,
    isSimulating = false, 
    simSchools = [], // 🌟 修复 1：改为复数数组，默认值为空数组
    wijLower = 0.15, wijUpper = 0.60
  } = filters || {};

  // 🌟 修复 2：传入数组给推演引擎
  const finalDemandFeatures = useMemo(() => {
    if (isSimulating && simSchools.length > 0) {
      return runSandboxSimulation(demandData.features, simSchools, wijLower, wijUpper);
    }
    return demandData.features;
  }, [isSimulating, simSchools, wijLower, wijUpper]);

  const filteredDemand = finalDemandFeatures.filter((d) => {
    return Number(d.properties.ma_hh) >= Number(income) && 
           Number(d.properties.Norm_Ai) <= Number(maxNormAi);
  });

  return (
    <MapContainer center={[22.3193, 114.1694]} zoom={11} style={{ height: "100vh", width: "100%" }} zoomControl={false}>
      
      {/* 直接将 App.jsx 传来的 onMapClick 传给地图点击处理器 */}
      <MapClickHandler isSimulating={isSimulating} onMapClick={onMapClick} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {showRaster && <TileLayer url="/equity_tiles/{z}/{x}/{y}.png" opacity={0.6} tms={true} />}

      {/* 社区点 */}
      {showDemand && filteredDemand.map((d, i) => (
        <Marker
          key={`demand-${i}`}
          position={[d.geometry.coordinates[1], d.geometry.coordinates[0]]}
          icon={createModernIcon(getColor(d.properties.Norm_Ai), d.properties.isSimulated)}
          eventHandlers={{ mouseover: (e) => e.target.openPopup(), mouseout: (e) => e.target.closePopup() }}
        >
          <Popup closeButton={false} autoPan={false}>
            <div style={{ textAlign: "center", fontSize: "12px" }}>
              <strong>Spatial Equity Score: {Number(d.properties.Norm_Ai).toFixed(3)}</strong><br/>
              <strong>Monthly Household Income: {Number(d.properties.ma_hh).toFixed(2)}</strong>
              {d.properties.isSimulated && (
                <div style={{ color: "#007AFF", fontWeight: "bold", marginTop: "2px" }}>
                  ( +{Number(d.properties.Ai_Gain).toFixed(3)} )
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* 真实学校 */}
      {showSchools && schoolData.features.map((s, i) => (
        <Marker
          key={`school-${i}`}
          position={[s.geometry.coordinates[1], s.geometry.coordinates[0]]}
          icon={schoolIcon}
        >
          <Popup className="glass-popup">
            <div style={{ fontSize: "13px" }}>
              <strong style={{ display: "block", marginBottom: "4px" }}>
                {s.properties.NAME_EN || s.properties.Name}
              </strong>
              <span style={{ color: "#666" }}>Tuition: {s.properties.Tuition}</span><br/>
              <span style={{ color: "#666" }}>Capacity: {s.properties.Capacity}</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* 🌟 修复 3：修正了 JSX 注释的语法错误，并正确遍历多校数组 */}
      {/* 渲染模拟学校阵列 */}
      {isSimulating && simSchools.map((school, idx) => (
        <Marker 
          key={`sim-sch-${idx}`} 
          position={[school.lat, school.lng]} 
          icon={simSchoolIcon}
        >
          <Popup>
            <strong>Simulated Facilities #{idx + 1}</strong><br/>
            Simulated Tuition (HKD): {school.tuition}<br/> Simulated Capacity: {school.capacity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}