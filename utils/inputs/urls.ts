import { LevelNode, slugOf } from './hierarchy';

export const scopePath = (trail: LevelNode[]) =>
  `/inputs${trail.map((node) => `/${slugOf(node)}`).join('')}`;

export const showingAllInputs = (query: { all?: string | string[] }) =>
  [query.all].flat()[0] === 'true';

// Every link within the inputs table carries the toggle
export const withAllInputs = (path: string, showAll: boolean) =>
  showAll ? `${path}?all=true` : path;
