/**
 * DevMentor Options Page
 * Privacy dashboard + quick controls for the extension
 */

/* global chrome */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Database,
  Keyboard,
  Lock,
  Plug,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface PrivacyStats {
  networkRequests: number;
  dataSent: number;
  dataReceived: number;
  processingTime: number;
  analysesPerformed: number;
  uptime: number;
  lastAnalysis?: {
    type: string;
    codeLength: number;
    processingTime: number;
    time: number;
  } | null;
  privacyGrade?: {
    grade: string;
    score: number;
    status: string;
    message: string;
  };
}

interface StorageStatus {
  hasEncryptionKey: boolean;
  secureKeys: string[];
  hasGithubToken: boolean;
  storageBytes: number;
}

const onDeviceFeatures = [
  'Code explanations & reviews',
  'Bug detection and remediation',
  'Documentation & refactor suggestions',
  'Storytelling and tutoring flows',
  'Gamified learning nudges'
];

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const formatDuration = (ms: number) => {
  if (!ms) return 'Just now';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const DevMentorOptions: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearingToken, setClearingToken] = useState(false);
  const [privacyStats, setPrivacyStats] = useState<PrivacyStats | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    hasEncryptionKey: false,
    secureKeys: [],
    hasGithubToken: false,
    storageBytes: 0
  });
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const sendMessage = useCallback(
    <T,>(payload: unknown) =>
      new Promise<T>((resolve, reject) => {
        chrome.runtime.sendMessage(payload, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response as T);
        });
      }),
    []
  );

  const loadPrivacyStats = useCallback(async () => {
    try {
      const response = await sendMessage<{
        success: boolean;
        data?: { stats: PrivacyStats };
        error?: string;
      }>({ action: 'privacy-stats' });

      if (response?.success && response.data?.stats) {
        setPrivacyStats(response.data.stats);
      } else {
        throw new Error(response?.error ?? 'Unable to load privacy stats');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Privacy monitor unavailable',
        description:
          error instanceof Error ? error.message : 'Could not fetch privacy statistics',
        variant: 'destructive'
      });
      setPrivacyStats(null);
    }
  }, [sendMessage, toast]);

  const loadStorageStatus = useCallback(async () => {
    const result = await chrome.storage.local.get([
      'devmentor_encryption_key',
      'devmentor_secure_data',
      'devmentor_github_enabled'
    ]);

    const secureData = (result.devmentor_secure_data ?? {}) as Record<string, unknown>;
    const secureKeys = Object.keys(secureData);

    setStorageStatus({
      hasEncryptionKey: Boolean(result.devmentor_encryption_key),
      secureKeys,
      hasGithubToken: secureKeys.includes('api_key'),
      storageBytes: JSON.stringify(secureData).length
    });

    setGithubEnabled(result.devmentor_github_enabled === true);
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadPrivacyStats(), loadStorageStatus()]);
    setRefreshing(false);
    setLastUpdated(Date.now());
  }, [loadPrivacyStats, loadStorageStatus]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshAll();
      setLoading(false);
    })();
  }, [refreshAll]);

  const handleOpenPopup = useCallback(() => {
    chrome.action.openPopup();
  }, []);

  const handleToggleGithub = useCallback(async () => {
    const next = !githubEnabled;
    setGithubEnabled(next);

    try {
      await chrome.storage.local.set({ devmentor_github_enabled: next });
      await sendMessage({
        action: 'set-github-enabled',
        enabled: next
      });
      toast({
        title: next ? 'GitHub integration enabled' : 'GitHub integration disabled',
        description: next
          ? 'The extension will use GitHub API when available.'
          : 'All GitHub API calls are now blocked until you re-enable them.'
      });
    } catch (error) {
      setGithubEnabled(!next);
      toast({
        title: 'Unable to update GitHub controls',
        description:
          error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'destructive'
      });
    }
  }, [githubEnabled, sendMessage, toast]);

  const handleRemoveGithubToken = useCallback(async () => {
    setClearingToken(true);
    try {
      const existing = await chrome.storage.local.get(['devmentor_secure_data']);
      const secureData: Record<string, unknown> = existing.devmentor_secure_data ?? {};

      if (secureData.api_key) {
        delete secureData.api_key;
        await chrome.storage.local.set({ devmentor_secure_data: secureData });
        toast({
          title: 'GitHub token removed',
          description: 'Encrypted token data was securely cleared.'
        });
      } else {
        toast({
          title: 'No token stored',
          description: 'You have not connected a GitHub personal access token yet.'
        });
      }

      await loadStorageStatus();
    } catch (error) {
      toast({
        title: 'Failed to remove token',
        description:
          error instanceof Error ? error.message : 'Could not clear encrypted token.',
        variant: 'destructive'
      });
    } finally {
      setClearingToken(false);
    }
  }, [loadStorageStatus, toast]);

  const privacyGrade = privacyStats?.privacyGrade;
  const privacyDataAvailable = Boolean(privacyStats);

  const formattedUptime = useMemo(
    () => (privacyStats ? formatDuration(privacyStats.uptime) : '--'),
    [privacyStats]
  );

  const secureKeysDisplay = storageStatus.secureKeys.length
    ? storageStatus.secureKeys.join(', ')
    : 'No sensitive keys stored';

  const renderPrivacyContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`privacy-skeleton-${idx}`}
                className="rounded-lg border border-muted bg-muted/20 p-4"
              >
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-3 h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!privacyDataAvailable) {
      return (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
          Privacy metrics are temporarily unavailable. Run an analysis to populate this dashboard.
        </div>
      );
    }

    const lastAnalysis = privacyStats?.lastAnalysis ?? null;
    const lastAnalysisElapsed = lastAnalysis?.time
      ? formatDuration(Date.now() - lastAnalysis.time)
      : 'Just now';
    const metrics = [
      { label: 'Network requests', value: privacyStats?.networkRequests ?? 0 },
      { label: 'Data sent externally', value: formatBytes(privacyStats?.dataSent ?? 0) },
      { label: 'Analyses performed', value: privacyStats?.analysesPerformed ?? 0 },
      { label: 'Uptime', value: formattedUptime }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-4 w-4 text-primary" />
              On-device Processing
            </h3>
            <p className="text-sm text-muted-foreground">
              All core features operate locally using Chrome Built-in AI.
            </p>
          </div>
          <Badge variant={privacyGrade ? 'outline' : 'destructive'} className="w-fit">
            {privacyGrade?.grade ?? 'Unavailable'}
          </Badge>
        </div>

        <div className="space-y-2">
          <Progress value={privacyGrade?.score ?? 0} />
          <p className="text-xs text-muted-foreground">
            {privacyGrade?.message ?? 'Privacy grade available'} - Uptime: {formattedUptime}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-muted bg-background/40 p-4"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>

        {lastAnalysis ? (
          <div className="rounded-lg border border-muted bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Last analysis</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {lastAnalysis.type.replace(/-/g, ' ')}
              </span>
              <span>{lastAnalysis.codeLength} chars</span>
              <span>{lastAnalysis.processingTime} ms</span>
              <span>{lastAnalysisElapsed} ago</span>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderSecureStorageContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">GitHub token status</span>
          <Badge variant={storageStatus.hasGithubToken ? 'default' : 'secondary'}>
            {storageStatus.hasGithubToken ? 'Token stored' : 'No token'}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Encryption key</span>
            <span className="font-medium text-foreground">
              {storageStatus.hasEncryptionKey ? 'Active' : 'Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Secure data footprint</span>
            <span className="font-medium text-foreground">
              {formatBytes(storageStatus.storageBytes)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground uppercase tracking-wide">Stored keys</p>
          <p>{secureKeysDisplay}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => window.open('https://github.com/settings/tokens', '_blank', 'noreferrer')}
          >
            <Sparkles className="h-4 w-4" />
            Generate GitHub Token
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={handleRemoveGithubToken}
            disabled={clearingToken}
          >
            <Database className={`h-4 w-4 ${clearingToken ? 'animate-spin' : ''}`} />
            Clear Token
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_rgba(8,11,23,0.98))] text-foreground">
      <div className="mx-auto w-full max-w-[1200px] space-y-8 px-6 py-8 md:px-10 md:py-12">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">DevMentor AI</h1>
              <p className="text-muted-foreground">
                Chrome Built-in AI Challenge 2025 - Options & Privacy Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshAll}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
            <Badge variant="secondary" className="shrink-0">
              {loading
                ? 'Loading...'
                : lastUpdated
                  ? `Updated ${formatDuration(Date.now() - lastUpdated)} ago`
                  : 'Awaiting data'}
            </Badge>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Privacy Dashboard
                </CardTitle>
                <CardDescription>
                  Transparent view of on-device processing, token storage, and GitHub connectivity.
                </CardDescription>
              </CardHeader>
              <CardContent>{renderPrivacyContent()}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  On-device features
                </CardTitle>
                <CardDescription>Core capabilities that never leave your machine.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onDeviceFeatures.map((feature) => (
                    <Badge key={feature} variant="secondary" className="rounded-full">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Keyboard className="h-4 w-4 text-primary" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Customize keyboard shortcuts to match your workflow preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-lg border border-muted bg-background/40 p-3">
                      <span className="text-muted-foreground">Toggle DevMentor Panel</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+Shift+D</kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-muted bg-background/40 p-3">
                      <span className="text-muted-foreground">Explain Selected Code</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+Shift+E</kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-muted bg-background/40 p-3">
                      <span className="text-muted-foreground">Debug Code</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+Shift+B</kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-muted bg-background/40 p-3">
                      <span className="text-muted-foreground">Take Screenshot</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Alt+Shift+S</kbd>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-xs text-muted-foreground">
                    <p className="mb-2 font-semibold text-foreground">Note</p>
                    <p className="mb-2">
                      Chrome limits extensions to 4 keyboard shortcuts maximum. These are the most frequently used actions.
                    </p>
                    <p>
                      Other features (Generate Docs, Refactor Code, etc.) are available via right-click context menu.
                      You can also customize these shortcuts using Chrome's built-in keyboard shortcut manager.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
                  >
                    <Settings className="h-4 w-4" />
                    Customize Shortcuts in Chrome
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need a refresher?</CardTitle>
                <CardDescription>
                  Launch the popup to try the on-device AI tutor or revisit core capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Version: 2.0.0 - Built exclusively with Chrome Built-in AI.</p>
                  <p>No external AI providers or data uploads required.</p>
                </div>
                <Button onClick={handleOpenPopup} className="w-full sm:w-auto">
                  Open Extension Popup
                </Button>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-4 w-4 text-primary" />
                  Secure Storage
                </CardTitle>
                <CardDescription>
                  GitHub tokens are encrypted locally before being stored.
                </CardDescription>
              </CardHeader>
              <CardContent>{renderSecureStorageContent()}</CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Plug className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">GitHub API Connection</CardTitle>
                  </div>
                  <Switch
                    checked={githubEnabled}
                    onCheckedChange={handleToggleGithub}
                    disabled={loading}
                  />
                </div>
                <CardDescription>
                  Enable or disable outbound GitHub requests with a single switch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  When enabled, DevMentor uses GitHub&apos;s public REST API for repository
                  insights. All requests respect your token quota and never leave your browser beyond
                  GitHub.
                </p>
                <p>
                  Disabling GitHub integration keeps every feature on-device. You can re-enable it at
                  any time.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DevMentorOptions;



