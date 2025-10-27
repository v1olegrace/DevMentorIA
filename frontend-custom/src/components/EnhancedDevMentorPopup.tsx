/**
 * Enhanced DevMentor AI Popup
 * Complete integration with all features:
 * - GitHub Integration
 * - Enhanced Gamification
 * - Storytelling Mode
 * - Multi-language Support
 * - Beautiful Animations
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  Code2,
  Bug,
  FileText,
  Zap,
  ClipboardCheck,
  Settings,
  Trophy,
  Book,
  Github,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import GamificationPanel from './GamificationPanel';
import StorytellingMode from './StorytellingMode';
import EnhancedSettingsPanel from './EnhancedSettingsPanel';
import { FunctionType } from '@/components/FunctionBar';
import { PROGRAMMING_LANGUAGES, detectLanguage } from '@/lib/languages';
import { githubService, GitHubRepository } from '@/services/github-service';

const EnhancedDevMentorPopup: React.FC = () => {
  const { t, i18n } = useTranslation();

  // State
  const [selectedFunction, setSelectedFunction] = useState<FunctionType>('explain');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [currentTab, setCurrentTab] = useState<'analyze' | 'gamification' | 'storytelling' | 'github'>('analyze');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    initialized: boolean;
    aiAvailable: boolean;
  }>({ initialized: false, aiAvailable: false });

  // GitHub state
  const [githubRepo, setGithubRepo] = useState('');
  const [githubResults, setGithubResults] = useState<GitHubRepository | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);

  const functions = [
    { id: 'explain' as FunctionType, icon: Code2, label: t('functions.explain'), color: 'bg-blue-500' },
    { id: 'bugs' as FunctionType, icon: Bug, label: t('functions.bugs'), color: 'bg-red-500' },
    { id: 'docs' as FunctionType, icon: FileText, label: t('functions.docs'), color: 'bg-green-500' },
    { id: 'optimize' as FunctionType, icon: Zap, label: t('functions.optimize'), color: 'bg-yellow-500' },
    { id: 'review' as FunctionType, icon: ClipboardCheck, label: t('functions.review'), color: 'bg-purple-500' },
  ];

  // Check AI status
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getAIStatus' });
        setAiStatus(response || { initialized: false, aiAvailable: false });
      } catch (error) {
        console.error('Error checking AI status:', error);
      }
    };

    checkAIStatus();
  }, []);

  // Handle code analysis
  const handleAnalyze = useCallback(async () => {
    try {
      setLoading(true);

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab.id) {
        toast.error(t('messages.noCode'));
        return;
      }

      // Get selected code
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'getSelectedCode'
      });

      if (!response?.code) {
        toast.error(t('messages.noCode'));
        return;
      }

      // Detect language if not explicitly selected
      const detectedLanguage = detectLanguage(response.code);
      const finalLanguage = selectedLanguage || detectedLanguage?.id || 'javascript';

      // Map function type to action
      const actionMap: Record<FunctionType, string> = {
        'explain': 'explain-code',
        'bugs': 'debug-code',
        'docs': 'generate-documentation',
        'optimize': 'refactor-code',
        'review': 'review-code'
      };

      const action = actionMap[selectedFunction];

      // Send to background
      const result = await chrome.runtime.sendMessage({
        action: action,
        code: response.code,
        context: {
          language: finalLanguage,
          query: searchQuery || undefined
        }
      });

      if (result.success) {
        // Show result
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'showResult',
          type: selectedFunction,
          data: result.data
        });

        toast.success(t('messages.analysisComplete'));

        // Award XP for analysis
        await chrome.runtime.sendMessage({
          action: 'award-xp',
          userId: 'default',
          amount: 50,
          reason: `Análise de código: ${selectedFunction}`
        });

        setTimeout(() => window.close(), 1500);
      } else {
        toast.error(result.error || t('messages.error'));
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('messages.error'));
    } finally {
      setLoading(false);
    }
  }, [selectedFunction, searchQuery, selectedLanguage, t]);

  // Handle GitHub repository search
  const handleGitHubSearch = async () => {
    if (!githubRepo) {
      toast.error('Digite um repositorio');
      return;
    }

    setGithubLoading(true);
    try {
      const repoInfo = await githubService.getRepositoryInfo(githubRepo);
      setGithubResults(repoInfo);
      toast.success('Repositorio encontrado!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar repositorio';
      toast.error(message);
    } finally {
      setGithubLoading(false);
    }
  };

  // Change UI language
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    toast.success(`Language changed to ${lang}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4"
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('popup.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('popup.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="h-8 w-8 p-0"
            >
              <Globe className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Language Selector Dropdown */}
        <AnimatePresence>
          {showLanguageSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Card className="p-2 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant={i18n.language === 'pt-BR' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('pt-BR')}>PT</Button>
                  <Button variant={i18n.language === 'en-US' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('en-US')}>EN</Button>
                  <Button variant={i18n.language === 'es-ES' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('es-ES')}>ES</Button>
                  <Button variant={i18n.language === 'zh-CN' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('zh-CN')}>中文</Button>
                  <Button variant={i18n.language === 'hi-IN' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('hi-IN')}>हिन्दी</Button>
                  <Button variant={i18n.language === 'it-IT' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('it-IT')}>IT</Button>
                  <Button variant={i18n.language === 'fr-FR' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('fr-FR')}>FR</Button>
                  <Button variant={i18n.language === 'de-DE' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('de-DE')}>DE</Button>
                  <Button variant={i18n.language === 'ja-JP' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('ja-JP')}>日本</Button>
                  <Button variant={i18n.language === 'ko-KR' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('ko-KR')}>한국</Button>
                  <Button variant={i18n.language === 'ru-RU' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('ru-RU')}>RU</Button>
                  <Button variant={i18n.language === 'ar-SA' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('ar-SA')}>عربي</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Status Badge */}
        <motion.div
          className="mb-4 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge
            variant={aiStatus.initialized && aiStatus.aiAvailable ? 'default' : 'secondary'}
            className="px-3 py-1"
          >
            <motion.div
              className={`w-2 h-2 rounded-full mr-2 ${
                aiStatus.initialized && aiStatus.aiAvailable
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-medium">
              {aiStatus.initialized && aiStatus.aiAvailable
                ? t('aiStatus.ready')
                : t('aiStatus.initializing')}
            </span>
          </Badge>
        </motion.div>

        {/* Main Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={(value) =>
            setCurrentTab(value as typeof currentTab)
          }
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyze" className="flex items-center gap-1">
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Game</span>
            </TabsTrigger>
            <TabsTrigger value="storytelling" className="flex items-center gap-1">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">Story</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-1">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
          </TabsList>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <Input
                type="text"
                placeholder={t('popup.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && aiStatus.aiAvailable) {
                    handleAnalyze();
                  }
                }}
              />

              {/* Programming Language Selector */}
              <Card className="p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('settings.languages.title')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROGRAMMING_LANGUAGES.filter(l => l.popularity === 'high').slice(0, 6).map((lang) => (
                      <Button
                        key={lang.id}
                        variant={selectedLanguage === lang.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage(lang.id)}
                        className="text-xs"
                      >
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Function Selection */}
              <div>
                <h3 className="text-sm font-semibold mb-2">{t('popup.chooseAnalysis')}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {functions.map((func, index) => {
                    const Icon = func.icon;
                    const isSelected = selectedFunction === func.id;

                    return (
                      <motion.div
                        key={func.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFunction(func.id)}
                          className={`w-full justify-start h-10 ${
                            isSelected ? `${func.color} text-white` : ''
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="text-sm">{func.label}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Analyze Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !aiStatus.aiAvailable}
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary to-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('popup.analyzing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('popup.analyzeButton')}
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Instructions */}
              <Card className="p-3 bg-secondary/30">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Como usar:</strong></p>
                  <p>1. {t('popup.selectCode')}</p>
                  <p>2. {t('popup.chooseAnalysis')}</p>
                  <p>3. Clique em "{t('popup.analyzeButton')}"</p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification">
            <GamificationPanel userId="default" />
          </TabsContent>

          {/* Storytelling Tab */}
          <TabsContent value="storytelling">
            <StorytellingMode />
          </TabsContent>

          {/* GitHub Tab */}
          <TabsContent value="github" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="owner/repo or URL"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !githubLoading) {
                      handleGitHubSearch();
                    }
                  }}
                />
                <Button onClick={handleGitHubSearch} disabled={githubLoading}>
                  {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('github.searchRepo')}
                </Button>
              </div>

              {githubResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4">
                    <h3 className="font-bold text-lg mb-2">{githubResults.fullName}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {githubResults.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Stars: {githubResults.stars.toLocaleString()}</div>
                      <div>Forks: {githubResults.forks.toLocaleString()}</div>
                      <div>Language: {githubResults.language}</div>
                      <div>License: {githubResults.license || 'No license'}</div>
                    </div>
                    {githubResults.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {githubResults.topics.map((topic: string) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <EnhancedSettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedDevMentorPopup;
