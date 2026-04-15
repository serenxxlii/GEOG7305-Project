/**
 * 纯净版 2SFA 推演引擎 (支持动态政策阈值)
 */
const calc_wij = (tuition, income, lower, upper) => {
  if (tuition <= 0 || income <= 0) return 0.0;
  const r = tuition / (income * 12.0); 
  
  if (r <= lower) return 1.0;
  if (r >= upper) return 0.0;
  if (upper <= lower) return 0.0; // 防御性保护
  
  // 动态线性衰减公式
  return 1.0 - (r - lower) / (upper - lower); 
};

export const runSandboxSimulation = (originalDemandFeatures, simSchools, wijLower, wijUpper) => {
  if (!simSchools || simSchools.length === 0) return originalDemandFeatures;

  const DISTANCE_THRESHOLD = 0.04; 
  const pointGains = new Array(originalDemandFeatures.length).fill(0);

  simSchools.forEach(school => {
    let sum_eff_pop = 0;
    const weights = [];

    originalDemandFeatures.forEach((p, idx) => {
      const dist = Math.sqrt(
        Math.pow(p.geometry.coordinates[0] - school.lng, 2) +
        Math.pow(p.geometry.coordinates[1] - school.lat, 2)
      );

      if (dist <= DISTANCE_THRESHOLD) {
        // 传入动态阈值计算权重
        const wij = calc_wij(school.tuition, Number(p.properties.ma_hh), wijLower, wijUpper);
        if (wij > 0) {
          sum_eff_pop += Number(p.properties.age_1) * wij;
          weights.push({ idx, wij });
        }
      }
    });

    if (sum_eff_pop > 0) {
      const rj = school.capacity / sum_eff_pop;
      weights.forEach(item => {
        pointGains[item.idx] += rj * item.wij; // 纯真实增量叠加
      });
    }
  });

  return originalDemandFeatures.map((f, i) => {
    const gain = pointGains[i];
    if (gain > 0) {
      const oldAi = Number(f.properties.Norm_Ai);
      return {
        ...f,
        properties: {
          ...f.properties,
          Norm_Ai: Math.min(oldAi + gain, 1.0), 
          Ai_Gain: gain,
          isSimulated: true
        }
      };
    }
    return f;
  });
};