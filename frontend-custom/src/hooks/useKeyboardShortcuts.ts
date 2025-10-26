import { useEffect } from "react";
import { FunctionType } from "@/components/FunctionBar";

interface UseKeyboardShortcutsProps {
  onFunctionChange: (func: FunctionType) => void;
  onShowShortcuts: () => void;
}

export const useKeyboardShortcuts = ({
  onFunctionChange,
  onShowShortcuts,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + E -> Explicar
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        onFunctionChange("explain");
      }
      
      // Ctrl + Shift + D -> Debug
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        onFunctionChange("bugs");
      }
      
      // Ctrl + Shift + O -> Otimizar
      if (e.ctrlKey && e.shiftKey && e.key === "O") {
        e.preventDefault();
        onFunctionChange("optimize");
      }
      
      // Ctrl + Shift + R -> Review
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        onFunctionChange("review");
      }
      
      // Ctrl + Shift + ? -> Mostrar Atalhos
      if (e.ctrlKey && e.shiftKey && e.key === "?") {
        e.preventDefault();
        onShowShortcuts();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onFunctionChange, onShowShortcuts]);
};
