import { Code2, Bug, FileText, Zap, ClipboardCheck } from "lucide-react";

export type FunctionType = "explain" | "bugs" | "docs" | "optimize" | "review";

interface FunctionBarProps {
  selectedFunction: FunctionType;
  onFunctionChange: (func: FunctionType) => void;
}

const functions = [
  { id: "explain" as FunctionType, icon: Code2, label: "Explicar" },
  { id: "bugs" as FunctionType, icon: Bug, label: "Bugs" },
  { id: "docs" as FunctionType, icon: FileText, label: "Docs" },
  { id: "optimize" as FunctionType, icon: Zap, label: "Otimizar" },
  { id: "review" as FunctionType, icon: ClipboardCheck, label: "Revisar" },
];

const FunctionBar = ({ selectedFunction, onFunctionChange }: FunctionBarProps) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <div className="flex gap-2 min-w-max px-1">
        {functions.map((func) => {
          const Icon = func.icon;
          const isSelected = selectedFunction === func.id;
          
          return (
            <button
              key={func.id}
              onClick={() => onFunctionChange(func.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-soft hover:brightness-110 scale-105"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-soft border border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{func.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FunctionBar;
