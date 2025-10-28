import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FunctionType } from "@/components/FunctionBar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Search,
  Camera,
  Moon,
  Sun
} from "lucide-react";

const DevMentorPopup: React.FC = () => {
  const [selectedFunction, setSelectedFunction] = useState<FunctionType>("explain");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiStatus, setAiStatus] = useState<{
    initialized: boolean;
    aiAvailable: boolean;
  }>({ initialized: false, aiAvailable: false });
  const [githubEnabled, setGithubEnabled] = useState<boolean>(true);
  const [capturing, setCapturing] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const aiReady = useMemo(
    () => aiStatus.initialized && aiStatus.aiAvailable,
    [aiStatus]
  );

  const isAIStarting = useMemo(
    () => !aiStatus.initialized || !aiStatus.aiAvailable,
    [aiStatus]
  );

  const functions = [
    { id: "explain" as FunctionType, icon: Code2, label: "Explain", color: "bg-blue-500" },
    { id: "bugs" as FunctionType, icon: Bug, label: "Fix Bugs", color: "bg-red-500" },
    { id: "docs" as FunctionType, icon: FileText, label: "Document", color: "bg-green-500" },
    { id: "optimize" as FunctionType, icon: Zap, label: "Optimize", color: "bg-yellow-500" },
    { id: "review" as FunctionType, icon: ClipboardCheck, label: "Review", color: "bg-purple-500" },
  ];

  // Verificar status da IA com timeout
  useEffect(() => {
    const checkAIStatus = async () => {
      console.log('[DevMentorPopup] Checking AI status...');

      try {
        // Timeout de 2 segundos para evitar travamento
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout checking AI status')), 2000)
        );

        const statusPromise = chrome.runtime.sendMessage({ action: 'getAIStatus' });

        const response = await Promise.race([statusPromise, timeoutPromise]);
        console.log('[DevMentorPopup] AI status received:', response);
        setAiStatus(response || { initialized: true, aiAvailable: true });
      } catch (error) {
        console.warn('[DevMentorPopup] AI status check failed, assuming available:', error);
        // Em caso de erro ou timeout, assume que está disponível para não travar a UI
        setAiStatus({ initialized: true, aiAvailable: true });
      }
    };

    // Start with a default available state to prevent UI blocking
    setAiStatus({ initialized: true, aiAvailable: true });

    // Then check actual status
    checkAIStatus();
  }, []);

  useEffect(() => {
    const syncGithubPreference = async () => {
      const result = await chrome.storage.local.get(['devmentor_github_enabled']);
      setGithubEnabled(result.devmentor_github_enabled !== false);
    };

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'local' && changes.devmentor_github_enabled) {
        setGithubEnabled(changes.devmentor_github_enabled.newValue !== false);
      }
    };

    syncGithubPreference();
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Dark mode persistence
  useEffect(() => {
    const loadDarkMode = async () => {
      const result = await chrome.storage.local.get(['devmentor_dark_mode']);
      setDarkMode(result.devmentor_dark_mode === true);
    };
    loadDarkMode();
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ devmentor_dark_mode: darkMode });
    }
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleAnalyze = useCallback(async () => {
    try {
      if (!aiReady) {
        toast.warning("Chrome Built-in AI is still starting up. Please try again in a few seconds.");
        return;
      }

      setLoading(true);

      // Verificar se ha codigo selecionado na pagina
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab.id) {
        toast.error("Unable to access the current tab.");
        return;
      }

      // Obter codigo selecionado da pagina
      let response;
      try {
        response = await chrome.tabs.sendMessage(currentTab.id, {
          action: 'getSelectedCode'
        });
      } catch (error: unknown) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as Error).message)
            : '';

        if (message.includes('Receiving end does not exist')) {
          toast.error("This site isn't supported yet. Try GitHub, StackOverflow, MDN or another supported domain.");
        } else {
          toast.error("We couldn't communicate with the current page. Refresh the tab and try again.");
        }
        return;
      }

      if (!response?.code) {
        toast.error("Select code on the page before running an analysis.");
        return;
      }

      // Mapear tipo de funcao para acao do back-end
      const actionMap: Record<FunctionType, string> = {
        explain: 'explain-code',
        bugs: 'debug-code',
        docs: 'document-code',
        optimize: 'refactor-code',
        review: 'review-code'
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

        toast.success("Analysis complete! Check the sidebar for results.");

        // Fechar popup apos 1.5 segundos
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        toast.error(result.error || "Something went wrong while processing the analysis.");
      }

    } catch (error) {
      console.error('Erro na analise:', error);
      toast.error("Unable to start the analysis. Refresh the tab and try again.");
    } finally {
      setLoading(false);
    }
  }, [aiReady, searchQuery, selectedFunction]);

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

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleCaptureScreenshot = useCallback(async () => {
    try {
      setCapturing(true);

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Minimize the sidebar panel before capturing screenshot
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'minimize-sidebar-panel' });
        // Wait for minimize animation to complete (300ms transition)
        await new Promise(resolve => setTimeout(resolve, 350));
      } catch (minimizeError) {
        // Panel might not be injected, continue anyway
        console.log('Sidebar panel not found, continuing with screenshot:', minimizeError);
      }

      // Capture visible tab
      const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
        format: 'png'
      });

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `devmentor-screenshot-${Date.now()}.png`;
      link.click();

      toast.success("Screenshot captured and saved!");
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast.error("Failed to capture screenshot. Make sure you have an active tab open.");
    } finally {
      setCapturing(false);
    }
  }, []);

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleDarkMode}
                  className="h-8 w-8 p-0 transition-all duration-300"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-180" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          placeholder="Ask DevMentor anything about your code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
          className="pl-10 h-12 text-sm bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary disabled:opacity-70"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && aiStatus.aiAvailable) {
              handleAnalyze();
            }
          }}
        />
      </div>

      {/* Status Badge */}
      <div className="mb-3 flex flex-col items-center gap-2 text-center">
        <Badge
          variant={aiReady ? "default" : "secondary"}
          className="px-3 py-1"
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${
            aiReady
              ? 'bg-green-500'
              : aiStatus.initialized
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`} />
          <span className="text-xs font-medium">
            {aiReady
              ? 'Chrome AI ready'
              : aiStatus.initialized
                ? 'Chrome AI temporarily unavailable'
                : 'Loading Chrome AI…'}
          </span>
        </Badge>
        {isAIStarting && (
          <p className="text-xs text-muted-foreground">
            Open DevMentor on a supported site and wait a moment. Chrome loads the on-device model the first time you run it.
          </p>
        )}
      </div>

      {/* Function Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Pick an analysis type:
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
                disabled={loading}
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
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !aiReady || capturing}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyse Selected Code
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {!aiReady && (
              <TooltipContent side="bottom" className="max-w-xs text-wrap">
                Chrome AI is still warming up for this session. The button enables automatically once the on-device model is ready.
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Screenshot Quick Action */}
        <TooltipProvider>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleCaptureScreenshot}
                disabled={capturing || loading}
                className="w-full h-10 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5"
              >
                {capturing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Capturing Screenshot...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Screenshot
                    <kbd className="ml-auto px-1.5 py-0.5 bg-muted rounded text-xs">Alt+Shift+S</kbd>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-semibold mb-1">Take Screenshot</p>
              <p>Capture and download the current page as PNG image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenHistory}
                  className="h-8"
                  disabled={!githubEnabled || capturing}
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
              </TooltipTrigger>
              {!githubEnabled && (
                <TooltipContent side="bottom">
                  Enable GitHub integration in the privacy dashboard to use history.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAnalytics}
                  className="h-8"
                  disabled={!githubEnabled || capturing}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
              </TooltipTrigger>
              {!githubEnabled && (
                <TooltipContent side="bottom">
                  Analytics require GitHub integration. Toggle it on from the privacy dashboard.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How to use:</strong></p>
          <p>1. Highlight code on a supported site</p>
          <p>2. Choose the analysis type</p>
          <p>3. Click "Analyse selected code"</p>
          <p>4. Review the results in the page sidebar</p>
        </div>
      </Card>

      {/* Footer - Keyboard Shortcuts */}
      <div className="mt-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <span>Toggle Panel:</span>
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-auto">Alt+Shift+D</kbd>
            <span>Screenshot:</span>
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-auto">Alt+Shift+S</kbd>
          </div>
          <p className="text-center pt-1 text-muted-foreground/70">
            Customize in <button type="button" onClick={handleOpenOptions} className="underline hover:text-primary">Settings</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevMentorPopup;











