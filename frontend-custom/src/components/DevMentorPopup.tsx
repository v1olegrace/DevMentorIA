import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FunctionType } from "@/components/FunctionBar";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Code2,
  Bug,
  FileText,
  Zap,
  ClipboardCheck,
  Settings,
  History,
  BarChart3,
  Search
} from "lucide-react";

const DevMentorPopup: React.FC = () => {
  const [selectedFunction, setSelectedFunction] = useState<FunctionType>("explain");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiStatus, setAiStatus] = useState<{
    initialized: boolean;
    aiAvailable: boolean;
  }>({ initialized: false, aiAvailable: false });

  const functions = [
    { id: "explain" as FunctionType, icon: Code2, label: "Explicar", color: "bg-blue-500" },
    { id: "bugs" as FunctionType, icon: Bug, label: "Bugs", color: "bg-red-500" },
    { id: "docs" as FunctionType, icon: FileText, label: "Docs", color: "bg-green-500" },
    { id: "optimize" as FunctionType, icon: Zap, label: "Otimizar", color: "bg-yellow-500" },
    { id: "review" as FunctionType, icon: ClipboardCheck, label: "Revisar", color: "bg-purple-500" },
  ];

  // Verificar status da IA
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getAIStatus' });
        setAiStatus(response || { initialized: false, aiAvailable: false });
      } catch (error) {
        console.error('Erro ao verificar status da IA:', error);
      }
    };

    checkAIStatus();
  }, []);

  const handleAnalyze = useCallback(async () => {
    try {
      setLoading(true);

      // Verificar se ha codigo selecionado na pagina
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab.id) {
        toast.error("Nao foi possivel acessar a aba atual");
        return;
      }

      // Obter codigo selecionado da pagina
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'getSelectedCode'
      });

      if (!response?.code) {
        toast.error("Por favor, selecione algum codigo na pagina primeiro");
        return;
      }

      // Mapear tipo de funcao para acao do back-end
      const actionMap: Record<FunctionType, string> = {
        'explain': 'explain-code',
        'bugs': 'debug-code',
        'docs': 'generate-documentation',
        'optimize': 'refactor-code',
        'review': 'review-code'
      };

      const action = actionMap[selectedFunction];

      // Enviar para o back-end (service worker)
      const result = await chrome.runtime.sendMessage({
        action: action,
        code: response.code,
        context: {
          language: response.language || 'javascript',
          query: searchQuery || undefined
        }
      });

      if (result.success) {
        // Enviar resultado para content script exibir
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'showResult',
          type: selectedFunction,
          data: result.data
        });

        toast.success("Analise concluida! Verifique o resultado na pagina.");

        // Fechar popup apos 1.5 segundos
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        toast.error(result.error || "Erro ao processar analise");
      }

    } catch (error) {
      console.error('Erro na analise:', error);
      toast.error("Erro ao iniciar analise. Verifique se ha codigo selecionado.");
    } finally {
      setLoading(false);
    }
  }, [selectedFunction, searchQuery]);

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const handleOpenHistory = () => {
    // Abrir pagina de historico em nova aba
    chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
  };

  const handleOpenAnalytics = () => {
    // Abrir pagina de analytics em nova aba
    chrome.tabs.create({ url: chrome.runtime.getURL('analytics.html') });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">DevMentor AI</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenOptions}
            className="h-8 w-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Faca sua pergunta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-sm bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && aiStatus.aiAvailable) {
              handleAnalyze();
            }
          }}
        />
      </div>

      {/* Status Badge */}
      <div className="mb-4 flex items-center justify-center">
        <Badge
          variant={aiStatus.initialized && aiStatus.aiAvailable ? "default" : "secondary"}
          className="px-3 py-1"
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${
            aiStatus.initialized && aiStatus.aiAvailable
              ? 'bg-green-500'
              : aiStatus.initialized
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`} />
          <span className="text-xs font-medium">
            {aiStatus.initialized && aiStatus.aiAvailable
              ? 'IA Pronta'
              : aiStatus.initialized
                ? 'IA Indisponivel'
                : 'Inicializando...'}
          </span>
        </Badge>
      </div>

      {/* Function Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Escolha o tipo de analise:
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {functions.map((func) => {
            const Icon = func.icon;
            const isSelected = selectedFunction === func.id;
            
            return (
              <Button
                key={func.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFunction(func.id)}
                className={`justify-start h-10 ${
                  isSelected ? `${func.color} text-white` : ''
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="text-sm">{func.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <Button
          onClick={handleAnalyze}
          disabled={loading || !aiStatus.aiAvailable}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analisar Codigo Selecionado
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenHistory}
            className="h-8"
          >
            <History className="w-4 h-4 mr-1" />
            Historico
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAnalytics}
            className="h-8"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Como usar:</strong></p>
          <p>1. Selecione codigo na pagina</p>
          <p>2. Escolha o tipo de analise</p>
          <p>3. Clique em "Analisar"</p>
          <p>4. Veja o resultado na sidebar</p>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
           <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+A</kbd> para atalho rapido
        </p>
      </div>
    </div>
  );
};

export default DevMentorPopup;













