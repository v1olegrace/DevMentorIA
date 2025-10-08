import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["Ctrl", "Shift", "E"], action: "Explicar Código" },
  { keys: ["Ctrl", "Shift", "D"], action: "Debug / Encontrar Bugs" },
  { keys: ["Ctrl", "Shift", "O"], action: "Otimizar Código" },
  { keys: ["Ctrl", "Shift", "R"], action: "Code Review" },
  { keys: ["Esc"], action: "Fechar Sidebar" },
  { keys: ["Ctrl", "Shift", "?"], action: "Mostrar Atalhos" },
];

const ShortcutsPanel = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Keyboard className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Atalhos de Teclado</h3>
      </div>
      
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 bg-card border border-border rounded-lg hover:border-primary/20 transition-all duration-200"
          >
            <span className="text-xs text-foreground">{shortcut.action}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="text-xs text-muted-foreground">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-2 bg-accent/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground text-center">
          💡 Use atalhos para agilizar seu fluxo de trabalho
        </p>
      </div>
    </div>
  );
};

export default ShortcutsPanel;
