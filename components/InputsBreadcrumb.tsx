import Breadcrumb, { Crumb, CrumbOption } from './Breadcrumb';

import { LevelNode, visibleLevels } from '../utils/inputs/hierarchy';
import { scopePath, withAllInputs } from '../utils/inputs/urls';
import useTranslate from '../utils/useTranslate';

interface CrumbsOptions {
  roots: LevelNode[];
  showAll: boolean;
  trail: LevelNode[];
  allLabel: string;
}

/**
 * One crumb per level of the trail, each listing the whole subtree below it
 * Each crumb level can be 'All', showing all the inputs in that section
 */
export function crumbsFor({ roots, showAll, trail, allLabel }: CrumbsOptions): Crumb[] {
  const hrefFor = (nodes: LevelNode[]) => withAllInputs(scopePath(nodes), showAll);

  const optionsFor = (nodes: LevelNode[], path: LevelNode[]): CrumbOption[] =>
    visibleLevels(nodes, showAll).map((child) => ({
      key: child.key,
      label: child.label,
      href: hrefFor([...path, child]),
      options: optionsFor(child.children, [...path, child]),
    }));

  // A real crumb: its menu offers "All" back to its own parent, plus its siblings
  const realCrumb = (node: LevelNode, depth: number): Crumb => {
    const path = trail.slice(0, depth + 1);
    const parentPath = trail.slice(0, depth);
    const siblings = depth === 0 ? roots : trail[depth - 1].children;

    const allOption: CrumbOption = { key: 'all', label: allLabel, href: hrefFor(parentPath) };

    return {
      key: node.key,
      label: node.label,
      href: hrefFor(path),
      selectedKey: node.key,
      options: [allOption, ...optionsFor(siblings, parentPath)],
    };
  };

  // The trailing "All": its menu offers "All" for the current scope itself, plus its children.
  // Skipped once the trail reaches a node with no children left to choose between
  // (e.g. Buildings, a leaf: "Demand > Buildings", nothing after)
  const trailingAllCrumb = (): Crumb | null => {
    const children = trail.length === 0 ? roots : trail[trail.length - 1].children;
    const visibleChildren = visibleLevels(children, showAll);

    if (trail.length > 0 && visibleChildren.length === 0) return null;

    const selfOption: CrumbOption = { key: 'all', label: allLabel, href: hrefFor(trail) };

    return {
      key: 'all',
      label: allLabel,
      href: hrefFor(trail),
      selectedKey: 'all',
      options: [selfOption, ...optionsFor(children, trail)],
    };
  };

  const realCrumbs = trail.map((node, depth) => realCrumb(node, depth));
  const trailing = trailingAllCrumb();

  return trailing ? [...realCrumbs, trailing] : realCrumbs;
}

export default function InputsBreadcrumb({
  roots,
  showAll,
  trail,
}: {
  roots: LevelNode[];
  showAll: boolean;
  trail: LevelNode[];
}) {
  const translate = useTranslate();

  return (
    <Breadcrumb crumbs={crumbsFor({ roots, showAll, trail, allLabel: translate('inputs.all') })} />
  );
}
