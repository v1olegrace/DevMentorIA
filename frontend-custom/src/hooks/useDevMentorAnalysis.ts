/* global chrome */
import { useCallback, useState } from "react";
import type { FunctionType } from "@/components/FunctionBar";
import { generateFallbackAnalysis } from "@/utils/fallback-analysis";

type AnalysisPayload = {
  code: string;
  analysisType: string;
  language: string;
  options?: Record<string, unknown>;
  timestamp: number;
};

type AnalysisResult = {
  analysis: string;
};

type ServiceWorkerResponse =
  | {
      success: true;
      analysis?: string;
      result?: string;
      data?: unknown;
    }
  | {
      success: false;
      error?: string;
    };

let bridgeCounter = 0;
const BRIDGE_TIMEOUT_MS = 1500;

const TYPE_MAP: Record<FunctionType, string> = {
  explain: "explain",
  bugs: "debug",
  docs: "document",
  optimize: "refactor",
  review: "review",
};

const hasChromeRuntime = (): boolean =>
  typeof chrome !== "undefined" && typeof chrome.runtime?.sendMessage === "function";

function callServiceWorker<T = unknown>(payload: { action: string; payload?: AnalysisPayload }): Promise<T> {
  if (hasChromeRuntime()) {
    return new Promise<T>((resolve, reject) => {
      chrome.runtime.sendMessage(payload, (response: ServiceWorkerResponse | undefined) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from service worker"));
          return;
        }
        if ("success" in response && response.success === false) {
          reject(new Error(response.error || "Request failed"));
          return;
        }
        const result = (response as ServiceWorkerResponse & { data?: unknown }).analysis ??
          (response as ServiceWorkerResponse & { result?: unknown }).result ??
          (response as ServiceWorkerResponse & { data?: unknown }).data ??
          (response as unknown);
        resolve(result as T);
      });
    });
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Runtime messaging is unavailable"));
  }

  return new Promise<T>((resolve, reject) => {
    const id = `bridge-${Date.now()}-${++bridgeCounter}`;

    function handleMessage(event: MessageEvent) {
      const data = event.data as {
        __from?: string;
        id?: string;
        resp?: ServiceWorkerResponse;
        error?: string;
      };

      if (!data || data.__from !== "devmentor-sw" || data.id !== id) {
        return;
      }

      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeout);

      if (data.error) {
        reject(new Error(data.error));
        return;
      }

      const resp = data.resp;
      if (!resp) {
        reject(new Error("No response from bridge"));
        return;
      }

      if ("success" in resp && resp.success === false) {
        reject(new Error(resp.error || "Request failed"));
        return;
      }

      const result =
        (resp as ServiceWorkerResponse & { analysis?: unknown }).analysis ??
        (resp as ServiceWorkerResponse & { result?: unknown }).result ??
        (resp as ServiceWorkerResponse & { data?: unknown }).data ??
        (resp as unknown);
      resolve(result as T);
    }

    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error("No response from service worker bridge"));
    }, BRIDGE_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);

    window.postMessage({ __from: "devmentor-ui", id, payload }, "*");
  });
}

export function useDevMentorAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCode = useCallback(
    async (code: string, funcType: FunctionType, options?: Record<string, unknown>) => {
      if (!code.trim()) {
        setError("Por favor, insira algum código para análise");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const analysisType = TYPE_MAP[funcType] ?? "explain";
        const payload: AnalysisPayload = {
          code,
          analysisType,
          language: (options?.language as string) || "javascript",
          options,
          timestamp: Date.now(),
        };

        const response = await callServiceWorker<ServiceWorkerResponse | string>({
          action: "analyzeCode",
          payload,
        });

        const analysisText =
          typeof response === "string"
            ? response
            : (response as ServiceWorkerResponse & { analysis?: string }).analysis ??
              (response as ServiceWorkerResponse & { result?: string }).result;

        if (!analysisText || typeof analysisText !== "string") {
          throw new Error("Resposta inválida do serviço de análise");
        }

        setResult({ analysis: analysisText });
      } catch (err) {
        console.warn("[useDevMentorAnalysis] Falling back to local analysis:", err);
        const fallback = generateFallbackAnalysis(code, funcType);
        setResult({ analysis: fallback });
        setError(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    analyzeCode,
    clearResult,
  };
}
