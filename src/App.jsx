import React, { useState } from "react";
import EquityMap from './components/EquityMap'; 
import FilterPanel from './components/FilterPanel';
import Legend from './components/Legend';
import './App.css'; 

export default function App() {
  /**
   * 1. 统一状态管理
   * 核心修改：将 simSchool 替换为 simSchools 数组
   */
  const [filterConfig, setFilterConfig] = useState({ 
    income: 30000, 
    maxNormAi: 1.0,
    showRaster: true,
    showDemand: true,
    showSchools: true,

    // 沙盘推演相关
    isSimulating: false,
    simSchools: [], // 🌟 修改点：支持存储多个模拟学校
    
    // 用于存放即将投放学校的参数（由面板控制）
    nextTuition: 100000,
    nextCapacity: 800,

    // ✅ 新增：政策宽容度阈值状态 (初始值与你 Python 一致)
    wijLower: 0.15,
    wijUpper: 0.60
  });

  /**
   * 2. 状态更新函数
   * 确保更新时不会丢失其他状态
   */
  const handleFilterChange = (newData) => {
    setFilterConfig(prev => ({ 
      ...prev, 
      ...newData 
    }));
  };

  /**
   * 3. 响应地图点击，添加新学校
   * 严格遵循 2SFA 逻辑，将新校信息追加到数组中
   */
  const handleMapClick = (coords) => {
    if (filterConfig.isSimulating) {
      const newSchool = {
        lat: coords.lat,
        lng: coords.lng,
        tuition: filterConfig.nextTuition, // 使用当前设定的模拟学费
        capacity: filterConfig.nextCapacity // 使用当前设定的模拟容量
      };

      // 🌟 修改点：使用数组展开运算符进行追加，而不是覆盖
      handleFilterChange({ 
        simSchools: [...filterConfig.simSchools, newSchool] 
      });
    }
  };

  return (
    <div className="app-container"> 
      
      {/* A. 地图组件 
        - 传入 handleMapClick 以便在点击时添加学校
      */}
      <EquityMap 
        filters={filterConfig} 
        onFilter={handleFilterChange} 
        onMapClick={handleMapClick} 
      />

      {/* B. 综合控制面板 
        - 增加清空功能和参数设置
      */}
      <FilterPanel 
        config={filterConfig} 
        onFilter={handleFilterChange} 
      />

      <Legend />

    </div>
  );
}