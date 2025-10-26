import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Maximize2, Minimize2, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResultsProps {
  result: string;
  type: string;
  onSave?: () => void;
}

const AnalysisResults = ({ result, type, onSave }: AnalysisResultsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Análise copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const typeLabels: Record<string, string> = {
    explain: "Explicar",
    bugs: "Bugs",
    docs: "Documentação",
    optimize: "Otimizar",
    review: "Revisar"
  };

  const typeIcons: Record<string, string> = {
    explain: "🔍",
    bugs: "🐛",
    docs: "📝",
    optimize: "⚡",
    review: "👀"
  };

  return (
    <div className={`bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-soft transition-all ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      <div className="bg-gradient-to-r from-primary to-primary/80 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          <h3 className="text-base md:text-lg font-bold text-primary-foreground">
            {typeIcons[type] || "📊"} Resultado da Análise - {typeLabels[type] || type}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 bg-muted/30 max-h-[600px] overflow-y-auto">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm md:text-base leading-relaxed bg-background/50 p-4 rounded-lg border border-border overflow-x-auto">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
