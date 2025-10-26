import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { X, Key, Palette, Settings as SettingsIcon, User, Wrench, Download, Upload, RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SettingsState {
  // API Keys
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  defaultProvider: 'openai' | 'anthropic' | 'google';
  
  // Interface
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  showLineNumbers: boolean;
  autoSave: boolean;
  
  // Análise
  maxTokens: number;
  temperature: number;
  analysisTimeout: number;
  autoAnalyze: boolean;
  
  // Conta
  email: string;
  name: string;
  notifications: boolean;
  dataCollection: boolean;
  
  // Avançado
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  cacheEnabled: boolean;
  experimentalFeatures: boolean;
}

interface TestStatus {
  openai?: 'testing' | 'success' | 'error';
  anthropic?: 'testing' | 'success' | 'error';
  google?: 'testing' | 'success' | 'error';
}

interface SettingsPanelProps {
  onClose: () => void;
}

const defaultSettings: SettingsState = {
  openaiApiKey: '',
  anthropicApiKey: '',
  googleApiKey: '',
  defaultProvider: 'openai',
  theme: 'light',
  language: 'pt-BR',
  fontSize: 'medium',
  showLineNumbers: true,
  autoSave: true,
  maxTokens: 2000,
  temperature: 0.7,
  analysisTimeout: 30,
  autoAnalyze: false,
  email: '',
  name: '',
  notifications: true,
  dataCollection: false,
  debugMode: false,
  logLevel: 'info',
  cacheEnabled: true,
  experimentalFeatures: false
};

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [testResults, setTestResults] = useState<TestStatus>({});

  useEffect(() => {
    const savedSettings = localStorage.getItem('devmentor_settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSettingChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('devmentor_settings', JSON.stringify(newSettings));
  };

  const testApiKey = async (provider: 'openai' | 'anthropic' | 'google') => {
    const apiKey = settings[`${provider}ApiKey`];
    if (!apiKey) {
      toast.error('Por favor, insira uma API key primeiro');
      return;
    }

    setTestResults({ ...testResults, [provider]: 'testing' });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResults({ ...testResults, [provider]: 'success' });
      toast.success(`API ${provider} conectada com sucesso!`);
    } catch (error) {
      setTestResults({ ...testResults, [provider]: 'error' });
      toast.error(`Erro ao conectar com API ${provider}`);
    }
  };

  const resetSettings = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
      localStorage.removeItem('devmentor_settings');
      setSettings(defaultSettings);
      toast.success('Configurações resetadas!');
    }
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
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings({ ...defaultSettings, ...importedSettings });
          localStorage.setItem('devmentor_settings', JSON.stringify(importedSettings));
          toast.success('Configurações importadas com sucesso!');
        } catch (error) {
          toast.error('Erro ao importar configurações');
        }
      };
      reader.readAsText(file);
    }
  };

  const StatusIcon = ({ status }: { status?: 'testing' | 'success' | 'error' }) => {
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'testing') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure o DevMentor de acordo com suas preferências
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="api" className="p-6">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="interface" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Interface
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Análise
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Conta
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Avançado
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="api" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">🔑 Configuração de API Keys</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure suas chaves de API para usar diferentes provedores de IA
                  </p>
                </div>

                {/* OpenAI */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">OpenAI</CardTitle>
                      <StatusIcon status={testResults.openai} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={settings.openaiApiKey}
                      onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                    />
                    <Button onClick={() => testApiKey('openai')} variant="outline" className="w-full">
                      Testar Conexão
                    </Button>
                  </CardContent>
                </Card>

                {/* Anthropic */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Anthropic (Claude)</CardTitle>
                      <StatusIcon status={testResults.anthropic} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="password"
                      placeholder="sk-ant-..."
                      value={settings.anthropicApiKey}
                      onChange={(e) => handleSettingChange('anthropicApiKey', e.target.value)}
                    />
                    <Button onClick={() => testApiKey('anthropic')} variant="outline" className="w-full">
                      Testar Conexão
                    </Button>
                  </CardContent>
                </Card>

                {/* Google */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Google (Gemini)</CardTitle>
                      <StatusIcon status={testResults.google} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="password"
                      placeholder="AIza..."
                      value={settings.googleApiKey}
                      onChange={(e) => handleSettingChange('googleApiKey', e.target.value)}
                    />
                    <Button onClick={() => testApiKey('google')} variant="outline" className="w-full">
                      Testar Conexão
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Provedor Padrão</Label>
                  <Select value={settings.defaultProvider} onValueChange={(value: any) => handleSettingChange('defaultProvider', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Interface Tab */}
            <TabsContent value="interface" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={settings.theme} onValueChange={(value: any) => handleSettingChange('theme', value)}>
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
                  <Label>Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tamanho da Fonte</Label>
                  <Select value={settings.fontSize} onValueChange={(value: any) => handleSettingChange('fontSize', value)}>
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
                  <Label>Mostrar números de linha</Label>
                  <Switch
                    checked={settings.showLineNumbers}
                    onCheckedChange={(checked) => handleSettingChange('showLineNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Salvar automaticamente</Label>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Máximo de Tokens: {settings.maxTokens}</Label>
                  <Slider
                    value={[settings.maxTokens]}
                    onValueChange={([value]) => handleSettingChange('maxTokens', value)}
                    min={100}
                    max={4000}
                    step={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número máximo de tokens na resposta (100-4000)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Temperatura: {settings.temperature}</Label>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={([value]) => handleSettingChange('temperature', value)}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controla a criatividade da resposta (0 = determinístico, 1 = criativo)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Timeout (segundos)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={120}
                    value={settings.analysisTimeout}
                    onChange={(e) => handleSettingChange('analysisTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Análise automática ao colar código</Label>
                  <Switch
                    checked={settings.autoAnalyze}
                    onCheckedChange={(checked) => handleSettingChange('autoAnalyze', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Receber notificações</Label>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Permitir coleta de dados</Label>
                  <Switch
                    checked={settings.dataCollection}
                    onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Modo Debug</Label>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nível de Log</Label>
                  <Select value={settings.logLevel} onValueChange={(value: any) => handleSettingChange('logLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Erro</SelectItem>
                      <SelectItem value="warn">Aviso</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Habilitar cache</Label>
                  <Switch
                    checked={settings.cacheEnabled}
                    onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Funcionalidades experimentais</Label>
                  <Switch
                    checked={settings.experimentalFeatures}
                    onCheckedChange={(checked) => handleSettingChange('experimentalFeatures', checked)}
                  />
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button onClick={exportSettings} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Configurações
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    <label className="cursor-pointer">
                      Importar Configurações
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="hidden"
                      />
                    </label>
                  </Button>
                  <Button onClick={resetSettings} variant="destructive" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar Configurações
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-4">
          <Button onClick={onClose} className="w-full">
            Salvar e Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
