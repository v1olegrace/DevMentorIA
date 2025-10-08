import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Trash2,
  Download,
  Upload,
  Info
} from "lucide-react";

const DevMentorOptions: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: true,
    autoSave: true,
    analytics: true,
    language: 'pt',
    aiProvider: 'chrome',
    cacheEnabled: true,
    premiumFeatures: false
  });

  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalTime: '0h',
    cacheSize: '0MB',
    lastUsed: 'Nunca'
  });

  useEffect(() => {
    // Carregar configurações salvas
    chrome.storage.sync.get(['devmentorSettings'], (result) => {
      if (result.devmentorSettings) {
        setSettings({ ...settings, ...result.devmentorSettings });
      }
    });

    // Carregar estatísticas
    chrome.storage.local.get(['devmentorStats'], (result) => {
      if (result.devmentorStats) {
        setStats(result.devmentorStats);
      }
    });
  }, []);

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    chrome.storage.sync.set({ devmentorSettings: newSettings });
  };

  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();
      setStats({
        totalAnalyses: 0,
        totalTime: '0h',
        cacheSize: '0MB',
        lastUsed: 'Nunca'
      });
    }
  };

  const handleExportData = async () => {
    const data = await chrome.storage.local.get();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devmentor-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Personalize sua experiência com o DevMentor AI</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Aparência */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Aparência</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Select value={settings.theme} onValueChange={(value) => saveSettings({ ...settings, theme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select value={settings.language} onValueChange={(value) => saveSettings({ ...settings, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">🇧🇷 Português</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Notificações */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Notificações</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notificações de análise</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => saveSettings({ ...settings, notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave">Salvamento automático</Label>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => saveSettings({ ...settings, autoSave: checked })}
                />
              </div>
            </div>
          </Card>

          {/* IA */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Inteligência Artificial</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="aiProvider">Provedor de IA</Label>
                <Select value={settings.aiProvider} onValueChange={(value) => saveSettings({ ...settings, aiProvider: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chrome">Chrome Built-in AI</SelectItem>
                    <SelectItem value="openai">OpenAI GPT</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="premiumFeatures">Recursos Premium</Label>
                <Badge variant={settings.premiumFeatures ? "default" : "secondary"}>
                  {settings.premiumFeatures ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Dados */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Dados e Cache</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cacheEnabled">Cache habilitado</Label>
                <Switch
                  id="cacheEnabled"
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) => saveSettings({ ...settings, cacheEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Analytics anônimos</Label>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked) => saveSettings({ ...settings, analytics: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={handleExportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button variant="destructive" size="sm" onClick={handleClearData} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Estatísticas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Estatísticas de Uso</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalAnalyses}</div>
              <div className="text-sm text-muted-foreground">Análises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalTime}</div>
              <div className="text-sm text-muted-foreground">Tempo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.cacheSize}</div>
              <div className="text-sm text-muted-foreground">Cache</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.lastUsed}</div>
              <div className="text-sm text-muted-foreground">Último Uso</div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>DevMentor AI v1.0.0 - Feito com ❤️ para desenvolvedores</p>
        </div>
      </div>
    </div>
  );
};

export default DevMentorOptions;
