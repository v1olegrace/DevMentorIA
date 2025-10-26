export interface UsageStats {
  explanations: number;
  bugsFound: number;
  docsGenerated: number;
  optimizations: number;
  reviews: number;
  averageResponseTime: number;
  totalRequests: number;
  lastUpdated: string;
}

const STATS_KEY = "devmentor_stats";

export const getStats = (): UsageStats => {
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    explanations: 0,
    bugsFound: 0,
    docsGenerated: 0,
    optimizations: 0,
    reviews: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    lastUpdated: new Date().toISOString(),
  };
};

export const updateStats = (type: keyof Pick<UsageStats, "explanations" | "bugsFound" | "docsGenerated" | "optimizations" | "reviews">, responseTime?: number) => {
  const stats = getStats();
  stats[type] = (stats[type] || 0) + 1;
  stats.totalRequests += 1;
  
  if (responseTime) {
    // Calcula média móvel do tempo de resposta
    const prevAvg = stats.averageResponseTime;
    const count = stats.totalRequests;
    stats.averageResponseTime = ((prevAvg * (count - 1)) + responseTime) / count;
  }
  
  stats.lastUpdated = new Date().toISOString();
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  
  return stats;
};

export const clearStats = () => {
  localStorage.removeItem(STATS_KEY);
};

export const trackCodeAnalysis = (functionType: string, startTime: number) => {
  const responseTime = (Date.now() - startTime) / 1000; // em segundos
  
  switch (functionType) {
    case "explain":
      updateStats("explanations", responseTime);
      break;
    case "bugs":
      updateStats("bugsFound", responseTime);
      break;
    case "docs":
      updateStats("docsGenerated", responseTime);
      break;
    case "optimize":
      updateStats("optimizations", responseTime);
      break;
    case "review":
      updateStats("reviews", responseTime);
      break;
  }
};
