import { useState, useEffect, useCallback } from 'react';

export function useQuery(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refetch();
    // We intentionally don't put dependencies array directly into useEffect
    // The user should wrap the fetcher in useCallback if it depends on changing values.
    // We add dependencies here just in case simple primitive arrays are passed.
  }, dependencies);

  return { data, error, loading, refetch };
}
