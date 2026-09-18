import { useEffect, useRef, useState } from 'react';

// The sticky main/sub nav's rendered height isn't a fixed number (session
// title, locale, etc can all affect it), so Chrome publishes it here and
// anything sticky further down the page reads it back to offset underneath.
const NAV_HEIGHT_VAR = '--nav-height';
const NAV_HEIGHT_EVENT = 'navheightchange';

const readNavHeightVar = () => {
  if (typeof document === 'undefined') return 0;

  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(NAV_HEIGHT_VAR));
  return Number.isNaN(value) ? 0 : value;
};

export function usePublishNavHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const publish = () => {
      const height = node.offsetHeight;
      document.documentElement.style.setProperty(NAV_HEIGHT_VAR, `${height}px`);
      window.dispatchEvent(new CustomEvent<number>(NAV_HEIGHT_EVENT, { detail: height }));
    };

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useNavHeight() {
  const [height, setHeight] = useState(readNavHeightVar);

  useEffect(() => {
    const onChange = (event: Event) => setHeight((event as CustomEvent<number>).detail);

    window.addEventListener(NAV_HEIGHT_EVENT, onChange);
    return () => window.removeEventListener(NAV_HEIGHT_EVENT, onChange);
  }, []);

  return height;
}
