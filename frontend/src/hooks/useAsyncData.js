import { useCallback, useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';

export function useAsyncData(loader, deps = []) {
  const { revision } = useAppState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loader();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'โหลดข้อมูลไม่สำเร็จ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loader()
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message || 'โหลดข้อมูลไม่สำเร็จ'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload, revision]);

  return { data, setData, loading, error, reload };
}
