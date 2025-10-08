import { Clock } from "lucide-react";
import catMascot from "@/assets/cat-mascot-orange.png";

interface ExplanationCardProps {
  question: string;
  explanation: string;
  timestamp: Date;
}

const ExplanationCard = ({ question, explanation, timestamp }: ExplanationCardProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-soft hover:border-primary/20 animate-slide-up">
      <div className="flex items-start gap-2">
        <img 
          src={catMascot} 
          alt="DevMentor" 
          className="w-5 h-5 mt-0.5 object-contain flex-shrink-0 animate-pulse-soft"
        />
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">
              Sua pergunta:
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {question}
            </p>
          </div>
          
          <div className="border-t border-border pt-2">
            <p className="text-xs font-semibold text-foreground mb-1">
              Explicação:
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {explanation}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationCard;
