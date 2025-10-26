import { BarChart3, Code2, Bug, FileText, Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface UsageStats {
  explanations: number;
  bugsFound: number;
  docsGenerated: number;
  optimizations: number;
  reviews: number;
  averageResponseTime: number;
}

const AnalyticsPanel = () => {
  const [stats, setStats] = useState<UsageStats>({
    explanations: 0,
    bugsFound: 0,
    docsGenerated: 0,
    optimizations: 0,
    reviews: 0,
    averageResponseTime: 0,
  });

  useEffect(() => {
    // Carrega estatísticas do localStorage
    const savedStats = localStorage.getItem("devmentor_stats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const statsItems = [
    { icon: Code2, label: "Explicações", value: stats.explanations, color: "text-blue-500" },
    { icon: Bug, label: "Bugs Encontrados", value: stats.bugsFound, color: "text-red-500" },
    { icon: FileText, label: "Docs Geradas", value: stats.docsGenerated, color: "text-green-500" },
    { icon: Zap, label: "Otimizações", value: stats.optimizations, color: "text-yellow-500" },
    { icon: BarChart3, label: "Reviews", value: stats.reviews, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Estatísticas de Uso</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statsItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-3 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-soft transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Tempo Médio</span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {stats.averageResponseTime.toFixed(1)}s
          </span>
        </div>
      </div>

      <div className="p-2 bg-accent/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground text-center">
          📊 Suas estatísticas são salvas localmente
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
