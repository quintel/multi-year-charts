export type Section = 'inputs' | 'outputs';

const storageKey = (collection: string, section: Section) =>
  `collections:lastVisited:${collection}:${section}`;

export function rememberVisit(collection: string, section: Section) {
  try {
    const url = `${window.location.pathname}${window.location.search}`;

    window.sessionStorage.setItem(storageKey(collection, section), url);
  } catch {
    // No session storage in a private window
  }
}

export function lastVisit(collection: string, section: Section): string | null {
  try {
    return window.sessionStorage.getItem(storageKey(collection, section));
  } catch {
    return null;
  }
}
