/**
 * Enhanced Settings Panel
 * Includes GitHub integration, language selection, and all settings
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  X,
  Key,
  Palette,
  Settings as SettingsIcon,
  Code2,
  Github,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { PROGRAMMING_LANGUAGES, getLanguagesByCategory } from '@/lib/languages';
import { githubService, RateLimitStatus } from '@/services/github-service';

interface SettingsState {
  // GitHub
  githubToken: string;

  // Interface
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;

  // Languages
  enabledLanguages: string[];

  // Analysis
  maxTokens: number;
  temperature: number;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

interface EnhancedSettingsPanelProps {
  onClose: () => void;
}

const defaultSettings: SettingsState = {
  githubToken: '',
  theme: 'light',
  language: 'pt-BR',
  fontSize: 'medium',
  animations: true,
  enabledLanguages: ['javascript', 'typescript', 'python', 'java', 'go'],
  maxTokens: 2000,
  temperature: 0.7,
  detailLevel: 'detailed'
};

const EnhancedSettingsPanel: React.FC<EnhancedSettingsPanelProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [githubStatus, setGithubStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [githubRateLimit, setGithubRateLimit] = useState<RateLimitStatus | null>(null);

  useEffect(() => {
    loadSettings();
    checkGitHubStatus();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('devmentor_enhanced_settings');
    if (saved) {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    }
  };

  const saveSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    localStorage.setItem('devmentor_enhanced_settings', JSON.stringify(newSettings));

    // Apply language change immediately
    if (newSettings.language !== i18n.language) {
      i18n.changeLanguage(newSettings.language);
    }

    toast.success(t('messages.settingsSaved'));
  };

  const handleSettingChange = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    saveSettings({ ...settings, [key]: value });
  };

  const checkGitHubStatus = async () => {
    try {
      const rateLimit = await githubService.getRateLimitStatus();
      setGithubRateLimit(rateLimit);
    } catch (error: unknown) {
      console.error('Error checking GitHub status:', error);
    }
  };

  const testGitHubConnection = async () => {
    if (!settings.githubToken) {
      toast.error(t('settings.api.tokenRequired', 'Token necessário'));
      return;
    }

    setGithubStatus('testing');

    try {
      await githubService.setToken(settings.githubToken);
      const rateLimit = await githubService.getRateLimitStatus();

      setGithubRateLimit(rateLimit);
      setGithubStatus('success');
      toast.success(t('messages.githubConnected'));
    } catch (error: unknown) {
      setGithubStatus('error');
      const message = error instanceof Error ? error.message : 'Erro ao conectar com GitHub';
      toast.error(message);
    }
  };

  const toggleLanguage = (langId: string) => {
    const newLanguages = settings.enabledLanguages.includes(langId)
      ? settings.enabledLanguages.filter(id => id !== langId)
      : [...settings.enabledLanguages, langId];

    handleSettingChange('enabledLanguages', newLanguages);
  };

  const selectAllLanguages = () => {
    handleSettingChange('enabledLanguages', PROGRAMMING_LANGUAGES.map(l => l.id));
  };

  const deselectAllLanguages = () => {
    handleSettingChange('enabledLanguages', []);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devmentor-settings.json';
    link.click();
    toast.success('Configurações exportadas!');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          saveSettings({ ...defaultSettings, ...imported });
          toast.success('Configurações importadas!');
        } catch (error) {
          toast.error('Erro ao importar configurações');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetSettings = () => {
    if (confirm(t('settings.advanced.confirmReset', 'Tem certeza?'))) {
      saveSettings(defaultSettings);
      toast.success('Configurações resetadas!');
    }
  };

  const StatusIcon = ({ status }: { status: 'idle' | 'testing' | 'success' | 'error' }) => {
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'testing') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    return null;
  };

  const languagesByCategory = {
    web: getLanguagesByCategory('web'),
    backend: getLanguagesByCategory('backend'),
    mobile: getLanguagesByCategory('mobile'),
    data: getLanguagesByCategory('data'),
    systems: getLanguagesByCategory('systems')
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="flex flex-col h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <SettingsIcon className="w-6 h-6" />
                  {t('settings.title')}
                </CardTitle>
                <CardDescription>{t('settings.subtitle')}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="github" className="p-6">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="github">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </TabsTrigger>
                <TabsTrigger value="languages">
                  <Code2 className="w-4 h-4 mr-2" />
                  {t('settings.tabs.languages')}
                </TabsTrigger>
                <TabsTrigger value="interface">
                  <Palette className="w-4 h-4 mr-2" />
                  {t('settings.tabs.interface')}
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  {t('settings.tabs.analysis')}
                </TabsTrigger>
              </TabsList>

              {/* GitHub Tab */}
              <TabsContent value="github" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{t('github.title')}</CardTitle>
                      <StatusIcon status={githubStatus} />
                    </div>
                    <CardDescription>
                      Configure seu token do GitHub para acesso à API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                      <Input
                        id="github-token"
                        type="password"
                        placeholder="ghp_..."
                        value={settings.githubToken}
                        onChange={(e) => handleSettingChange('githubToken', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Obtenha seu token em: github.com/settings/tokens
                      </p>
                    </div>

                    <Button onClick={testGitHubConnection} className="w-full">
                      {githubStatus === 'testing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {t('settings.api.testConnection')}
                    </Button>

                    {githubRateLimit && (
                      <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm">Rate Limit Status</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Limit:</span>
                            <span className="ml-2 font-mono">{githubRateLimit.limit}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="ml-2 font-mono">{githubRateLimit.remaining}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Languages Tab */}
              <TabsContent value="languages" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{t('settings.languages.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.languages.description')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={selectAllLanguages}>
                      {t('settings.languages.selectAll')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={deselectAllLanguages}>
                      {t('settings.languages.deselectAll')}
                    </Button>
                  </div>
                </div>

                {Object.entries(languagesByCategory).map(([category, languages]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {languages.map((lang) => (
                          <motion.div
                            key={lang.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/50"
                          >
                            <Checkbox
                              id={lang.id}
                              checked={settings.enabledLanguages.includes(lang.id)}
                              onCheckedChange={() => toggleLanguage(lang.id)}
                            />
                            <label
                              htmlFor={lang.id}
                              className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                            >
                              <span>{lang.name}</span>
                              {lang.popularity === 'high' && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </label>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Interface Tab */}
              <TabsContent value="interface" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>{t('settings.interface.theme')}</Label>
                      <Select
                        value={settings.theme}
                        onValueChange={(value) =>
                          handleSettingChange('theme', value as SettingsState['theme'])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('settings.interface.language')}</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => handleSettingChange('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español (España)</SelectItem>
                          <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                          <SelectItem value="hi-IN">हिन्दी (भारत)</SelectItem>
                          <SelectItem value="it-IT">Italiano</SelectItem>
                          <SelectItem value="fr-FR">Français</SelectItem>
                          <SelectItem value="de-DE">Deutsch</SelectItem>
                          <SelectItem value="ja-JP">日本語</SelectItem>
                          <SelectItem value="ko-KR">한국어</SelectItem>
                          <SelectItem value="ru-RU">Русский</SelectItem>
                          <SelectItem value="ar-SA">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('settings.interface.fontSize')}</Label>
                      <Select
                        value={settings.fontSize}
                        onValueChange={(value) =>
                          handleSettingChange('fontSize', value as SettingsState['fontSize'])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeno</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>{t('settings.interface.animations')}</Label>
                      <Switch
                        checked={settings.animations}
                        onCheckedChange={(checked) => handleSettingChange('animations', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label>
                        {t('settings.analysis.maxTokens')}: {settings.maxTokens}
                      </Label>
                      <Slider
                        value={[settings.maxTokens]}
                        onValueChange={([value]) => handleSettingChange('maxTokens', value)}
                        min={100}
                        max={4000}
                        step={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {t('settings.analysis.temperature')}: {settings.temperature.toFixed(1)}
                      </Label>
                      <Slider
                        value={[settings.temperature]}
                        onValueChange={([value]) => handleSettingChange('temperature', value)}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('settings.analysis.detailLevel')}</Label>
                      <Select
                        value={settings.detailLevel}
                        onValueChange={(value) =>
                          handleSettingChange('detailLevel', value as SettingsState['detailLevel'])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="detailed">Detalhado</SelectItem>
                          <SelectItem value="comprehensive">Comprehensivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button onClick={exportSettings} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    <label className="cursor-pointer">
                      Importar
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="hidden"
                      />
                    </label>
                  </Button>
                  <Button onClick={resetSettings} variant="destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="border-t p-4">
            <Button onClick={onClose} className="w-full">
              {t('common.close')}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSettingsPanel;
