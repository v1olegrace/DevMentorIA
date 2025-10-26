import { Video, Brain, Code, BookOpen } from "lucide-react";

const learningOptions = [
  { id: "videos", icon: Video, label: "Videoaulas", description: "Tutoriais em vídeo" },
  { id: "quiz", icon: Brain, label: "Quiz Interativo", description: "Teste seus conhecimentos" },
  { id: "playground", icon: Code, label: "Playground", description: "Experimente código" },
  { id: "citations", icon: BookOpen, label: "Referências", description: "Documentação útil" },
];

const LearningCenter = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Centro de Aprendizado</h3>
      <div className="grid grid-cols-2 gap-2">
        {learningOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              className="flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-soft transition-all duration-200 hover:scale-[1.02]"
            >
              <Icon className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LearningCenter;
