import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, RotateCcw } from "lucide-react";

interface Analysis {
  id: number;
  code: string;
  type: string;
  result: string;
  createdAt: string;
  projectId?: string;
}

interface AnalysisHistoryProps {
  analyses: Analysis[];
  onLoadAnalysis: (analysis: Analysis) => void;
}

const AnalysisHistory = ({ analyses, onLoadAnalysis }: AnalysisHistoryProps) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === "all") return true;
    return analysis.type === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const typeIcons: Record<string, string> = {
    explain: "🔍",
    bugs: "🐛",
    docs: "📝",
    optimize: "⚡",
    review: "👀"
  };

  const typeLabels: Record<string, string> = {
    explain: "Explicar",
    bugs: "Bugs",
    docs: "Docs",
    optimize: "Otimizar",
    review: "Revisar"
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          📚 Histórico de Análises
        </h2>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          {Object.entries(typeLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(key)}
            >
              {typeIcons[key]} {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnalyses.length === 0 ? (
          <Card className="p-8 text-center space-y-4">
            <div className="text-6xl">📝</div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Nenhuma análise encontrada</p>
              <p className="text-muted-foreground">Comece analisando seu primeiro código!</p>
            </div>
          </Card>
        ) : (
          filteredAnalyses.map(analysis => (
            <Card key={analysis.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeIcons[analysis.type]}</span>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {typeLabels[analysis.type]}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
                  <pre className="text-sm truncate whitespace-pre-wrap line-clamp-3">
                    {analysis.code}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadAnalysis(analysis)}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Carregar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadAnalysis(analysis)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Resultado
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;
