import ExplanationCard from "./ExplanationCard";

export interface HistoryItem {
  id: string;
  question: string;
  explanation: string;
  timestamp: Date;
}

interface HistorySectionProps {
  history: HistoryItem[];
}

const HistorySection = ({ history }: HistorySectionProps) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhuma explicação gerada ainda. Comece fazendo uma pergunta! 🐾
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      {history.map((item) => (
        <ExplanationCard
          key={item.id}
          question={item.question}
          explanation={item.explanation}
          timestamp={item.timestamp}
        />
      ))}
    </div>
  );
};

export default HistorySection;
