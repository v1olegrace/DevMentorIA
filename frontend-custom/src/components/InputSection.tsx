import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface InputSectionProps {
  onGenerate: (input: string) => void;
  isLoading?: boolean;
}

const InputSection = ({ onGenerate, isLoading = false }: InputSectionProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onGenerate(input);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-2 animate-fade-in">
      <Textarea
        placeholder="Cole seu código ou faça uma pergunta..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="min-h-[80px] resize-none rounded-xl bg-card border-border text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-soft"
        disabled={isLoading}
      />
      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="w-full h-9 text-sm font-medium rounded-xl bg-primary hover:bg-primary/90 hover:brightness-110 text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-soft hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? "Gerando..." : "Gerar Explicação"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Ctrl + Enter para enviar
      </p>
    </div>
  );
};

export default InputSection;
