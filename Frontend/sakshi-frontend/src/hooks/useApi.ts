import { useState, useCallback, useEffect, useRef } from "react";

interface ApiState<T> {
  data:       T | null;
  loading:    boolean;
  error:      string | null;
  isNetwork:  boolean;
}

interface UseApiOptions {
  immediate?: boolean;  // auto-call on mount
  onSuccess?: (data: unknown) => void;
  onError?:   (err: string)   => void;
}

/**
 * Generic hook for API calls with loading, error, and retry support.
 * Works with both demo-mode services and real Axios calls.
 */
export function useApi<T>(
  apiFn: () => Promise<T>,
  options: UseApiOptions = {},
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: immediate, error: null, isNetwork: false });
  const mountedRef = useRef(true);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;
    setState(s => ({ ...s, loading: true, error: null, isNetwork: false }));
    try {
      const result = await apiFn();
      if (!mountedRef.current) return;
      setState({ data: result, loading: false, error: null, isNetwork: false });
      onSuccess?.(result);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const e = err as { message?: string; isNetwork?: boolean };
      const msg = e?.message ?? "An unexpected error occurred";
      setState({ data: null, loading: false, error: msg, isNetwork: !!e?.isNetwork });
      onError?.(msg);
    }
  }, [apiFn, onSuccess, onError]);

  useEffect(() => { if (immediate) execute(); }, [immediate, execute]);

  return { ...state, refetch: execute };
}
