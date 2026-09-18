import { useEffect, useState } from 'react';

export interface Area {
  name: Record<string, string>;
  icon?: { href: string; width: number; height: number };
}

// Areas are static reference data
const cache = new Map<string, Area>();

export default function useArea(areaCode: string) {
  const [area, setArea] = useState<Area | null | undefined>(() => cache.get(areaCode));

  useEffect(() => {
    const cached = cache.get(areaCode);

    if (cached) {
      setArea(cached);
      return;
    }

    let active = true;

    fetch(`/api/areas/${areaCode}`, { headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Area | null) => {
        // A failure is not cached, so the next navigation retries
        if (data) cache.set(areaCode, data);
        if (active) setArea(data);
      })
      .catch(() => {
        if (active) setArea(null);
      });

    return () => {
      active = false;
    };
  }, [areaCode]);

  return area;
}

export const resetAreaCache = () => cache.clear();
