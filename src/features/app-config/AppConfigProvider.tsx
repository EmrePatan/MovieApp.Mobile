import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { fetchRemoteAppConfig } from './app-config-api';
import { loadCachedAppConfig, saveCachedAppConfig } from './app-config-storage';
import {
  evaluateAppConfig,
  evaluateCachedBlockingOnly,
} from './evaluate-app-config';
import { readInstalledNativeBuild } from './read-installed-build';
import { mergeWithDefaultRemoteAppConfig } from './parse-remote-app-config';
import type { AppConfigEvaluation, RemoteAppConfig, StartupBlockingKind } from './types';
import { DEFAULT_REMOTE_APP_CONFIG } from './types';

const FOREGROUND_REFRESH_STALE_MS = 10 * 60 * 1000;

export interface AppConfigContextValue {
  isStartupResolved: boolean;
  blocking: StartupBlockingKind;
  evaluation: AppConfigEvaluation;
  config: RemoteAppConfig;
  refreshConfig: () => Promise<void>;
  isRefreshing: boolean;
  markOptionalUpdateShownThisSession: () => void;
  optionalUpdateSessionSuppressed: boolean;
}

export const AppConfigContext = createContext<AppConfigContextValue | null>(null);

interface AppConfigProviderProps {
  children: ReactNode;
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const installedBuild = useMemo(() => readInstalledNativeBuild(), []);
  const [config, setConfig] = useState<RemoteAppConfig>(DEFAULT_REMOTE_APP_CONFIG);
  const [isStartupResolved, setIsStartupResolved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [optionalUpdateSessionSuppressed, setOptionalUpdateSessionSuppressed] = useState(false);
  const fetchInFlightRef = useRef<Promise<void> | null>(null);
  const lastFetchAtRef = useRef(0);

  const evaluation = useMemo(
    () => evaluateAppConfig(installedBuild, config),
    [config, installedBuild],
  );

  const blocking = evaluation.blocking;

  const applyResolvedConfig = useCallback((nextConfig: RemoteAppConfig) => {
    const merged = mergeWithDefaultRemoteAppConfig(nextConfig);
    setConfig(merged);
    setIsStartupResolved(true);
  }, []);

  const resolveConfig = useCallback(
    async (options?: { startup?: boolean }) => {
      if (fetchInFlightRef.current) {
        await fetchInFlightRef.current;
        return;
      }

      const run = async () => {
        if (!options?.startup) {
          setIsRefreshing(true);
        }

        try {
          const cached = await loadCachedAppConfig();
          if (options?.startup && cached) {
            const cachedBlocking = evaluateCachedBlockingOnly(installedBuild, cached.config);
            if (cachedBlocking !== 'none') {
              applyResolvedConfig(cached.config);
            }
          }

          const remote = await fetchRemoteAppConfig();
          if (remote) {
            await saveCachedAppConfig(remote);
            applyResolvedConfig(remote);
            lastFetchAtRef.current = Date.now();
            return;
          }

          if (cached) {
            applyResolvedConfig(cached.config);
            return;
          }

          applyResolvedConfig(DEFAULT_REMOTE_APP_CONFIG);
        } finally {
          if (!options?.startup) {
            setIsRefreshing(false);
          }
          fetchInFlightRef.current = null;
        }
      };

      const promise = run();
      fetchInFlightRef.current = promise;
      await promise;
    },
    [applyResolvedConfig, installedBuild],
  );

  useEffect(() => {
    void resolveConfig({ startup: true });
  }, [resolveConfig]);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        return;
      }

      if (Date.now() - lastFetchAtRef.current < FOREGROUND_REFRESH_STALE_MS) {
        return;
      }

      void resolveConfig();
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [resolveConfig]);

  const refreshConfig = useCallback(async () => {
    await resolveConfig();
  }, [resolveConfig]);

  const markOptionalUpdateShownThisSession = useCallback(() => {
    setOptionalUpdateSessionSuppressed(true);
  }, []);

  const value = useMemo<AppConfigContextValue>(
    () => ({
      isStartupResolved,
      blocking,
      evaluation,
      config,
      refreshConfig,
      isRefreshing,
      markOptionalUpdateShownThisSession,
      optionalUpdateSessionSuppressed,
    }),
    [
      blocking,
      config,
      evaluation,
      isRefreshing,
      isStartupResolved,
      markOptionalUpdateShownThisSession,
      optionalUpdateSessionSuppressed,
      refreshConfig,
    ],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}
