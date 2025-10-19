import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, Project } from "@/hooks/useProjects";
import { useDevMentorAnalysis } from "@/hooks/useDevMentorAnalysis";
import { useTranslation } from "@/hooks/useTranslation";
import { FunctionType } from "@/components/FunctionBar";
import { toast } from "sonner";
import Header from "@/components/Header";
import FunctionBar from "@/components/FunctionBar";
import CodeEditor from "@/components/CodeEditor";
import ProjectsList from "@/components/ProjectsList";
import AnalysisResults from "@/components/AnalysisResults";
import AnalysisHistory from "@/components/AnalysisHistory";
import SettingsPanel from "@/components/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, History } from "lucide-react";
import { LoveableMascot } from "@/components/LoveableMascot";

interface Analysis {
  id: number;
  code: string;
  type: FunctionType;
  result: string;
  createdAt: string;
  projectId?: string;
}

const MainApp = () => {
  const { user } = useAuth();
  const { t, language, changeLanguage } = useTranslation();
  const [code, setCode] = useState("");
  const [selectedFunction, setSelectedFunction] = useState<FunctionType>("explain");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeView, setActiveView] = useState<"analyzer" | "history">("analyzer");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const { loading, error, result, analyzeCode, clearResult } = useDevMentorAnalysis();

  // Carregar análises do localStorage
  useEffect(() => {
    const savedAnalyses = localStorage.getItem("devmentor_analyses");
    if (savedAnalyses) {
      setAnalyses(JSON.parse(savedAnalyses));
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      toast.error(t('pleaseEnterCode'));
      return;
    }

    await analyzeCode(code, selectedFunction, { projectId: selectedProject?.id });
  }, [code, selectedFunction, selectedProject, analyzeCode, t]);

  const handleLoadAnalysis = (analysis: Analysis) => {
    setCode(analysis.code);
    setSelectedFunction(analysis.type);
    setActiveView("analyzer");
    toast.success(t('analysisLoaded'));
  };

  const handleSaveAnalysis = () => {
    toast.success(t('analysisSaved'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, selectedFunction, selectedProject, handleAnalyze]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (result) {
      toast.success(t('analysisCompleted'));
      
      // Salvar no histórico
      const newAnalysis: Analysis = {
        id: Date.now(),
        code,
        type: selectedFunction,
        result: result.analysis,
        createdAt: new Date().toISOString(),
        projectId: selectedProject?.id
      };
      
      setAnalyses(prevAnalyses => {
        const updatedAnalyses = [newAnalysis, ...prevAnalyses];
        localStorage.setItem("devmentor_analyses", JSON.stringify(updatedAnalyses));
        return updatedAnalyses;
      });
    }
  }, [result, code, selectedFunction, selectedProject, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header 
        language={language} 
        onLanguageChange={changeLanguage}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      
      <main className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 md:gap-6">
          {/* Sidebar */}
          <aside className="space-y-4">
            {user && (
              <ProjectsList
                userId={user.id}
                onSelectProject={setSelectedProject}
              />
            )}
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={activeView === "analyzer" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("analyzer")}
                className="flex-1"
              >
                🔍 {t('analyzer')}
              </Button>
              <Button
                variant={activeView === "history" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("history")}
                className="flex-1"
              >
                <History className="w-4 h-4 mr-1" />
                {t('history')}
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {activeView === "analyzer" ? (
              <>

            {/* Header Section */}
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <LoveableMascot size="lg" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t('title')}
                  </h1>
                  <p className="text-base text-muted-foreground">
                    {selectedProject
                      ? `📁 ${t('projectLabel')}: ${selectedProject.name}`
                      : t('subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Function Tabs */}
            <FunctionBar
              selectedFunction={selectedFunction}
              onFunctionChange={(func) => {
                setSelectedFunction(func);
                clearResult();
              }}
            />

            {/* Input Section for Questions */}
            <div className="space-y-4 animate-fade-in">
              <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all">
                <div className="mb-3">
                  <label className="text-sm font-semibold text-foreground block mb-1">
                    💬 Faça uma Pergunta
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Digite sua pergunta para a IA
                  </p>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t('codePlaceholder')}
                  className="w-full min-h-[100px] p-3 rounded-lg border-2 border-border bg-background text-foreground resize-none focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Code Editor Section */}
              <div className="bg-card border-2 border-border rounded-2xl p-4 md:p-6 shadow-soft hover:shadow-lg transition-all">
                <div className="mb-3">
                  <label className="text-sm font-semibold text-foreground block mb-1">
                    💻 Editor de Código (Opcional)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Cole seu código aqui para análise detalhada
                  </p>
                </div>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  height="300px"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || !code.trim()}
                size="lg"
                className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-soft hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('analyze')}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                ⌨️ {t('shortcutHint')}
              </p>
            </div>

            {/* Results Section */}
            {result && (
              <div className="space-y-4 animate-slide-up">
                <AnalysisResults
                  result={result.analysis}
                  type={selectedFunction}
                  onSave={handleSaveAnalysis}
                />
              </div>
            )}

            {/* Loading State */}
            {loading && !result && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-base font-medium text-muted-foreground">
                  {t('analyzing')}
                </p>
              </div>
            )}
            </>
            ) : (
              <AnalysisHistory
                analyses={analyses}
                onLoadAnalysis={handleLoadAnalysis}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainApp;
