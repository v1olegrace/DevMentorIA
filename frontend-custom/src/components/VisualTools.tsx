import { Network, Film, Camera } from "lucide-react";

const visualTools = [
  { id: "diagrams", icon: Network, label: "Diagramas", description: "Visualize estruturas" },
  { id: "animation", icon: Film, label: "Animações", description: "Código em movimento" },
  { id: "screenshot", icon: Camera, label: "Screenshot AI", description: "Analise imagens" },
];

const VisualTools = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Ferramentas Visuais</h3>
      <div className="space-y-2">
        {visualTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              type="button"
              key={tool.id}
              className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-soft transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-foreground">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VisualTools;
