import { useCallback, useEffect, useRef, useState } from 'react';

type AsyncState<T> = {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  reload: () => Promise<void>;
};

/** Runs `load` on mount and whenever `reload` is called, tracking loading and error state. */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const latestCall = useRef(0);

  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    const call = ++latestCall.current;
    setLoading(true);
    try {
      const result = await run();
      if (call === latestCall.current) {
        setData(result);
        setError(undefined);
      }
    } catch (e) {
      if (call === latestCall.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (call === latestCall.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}
