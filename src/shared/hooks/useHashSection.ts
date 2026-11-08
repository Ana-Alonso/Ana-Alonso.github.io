import { useCallback, useEffect, useState } from 'react';
import { sectionIdFromHash } from '../../record/content';

export interface HashLinkProps {
  sectionIdFromUrl: string | null;
  onSectionChange: (id: string | null) => void;
}

function rawFromHash(): string | null {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (raw.length === 0) return null;
  try {
    return sectionIdFromHash(decodeURIComponent(raw));
  } catch {
    return sectionIdFromHash(raw);
  }
}

export function useHashSection() {
  const [raw, setRaw] = useState<string | null>(rawFromHash);

  useEffect(() => {
    const sync = () => setRaw(rawFromHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const write = useCallback((next: string | null) => {
    if (next) {
      if (rawFromHash() === next) setRaw(next);
      else window.location.hash = `/${next}`;
      return;
    }
    if (!rawFromHash()) {
      setRaw(null);
      return;
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setRaw(null);
  }, []);

  return [raw, write] as const;
}
