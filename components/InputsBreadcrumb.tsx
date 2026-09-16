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

  const crumb = (node: LevelNode | null, depth: number): Crumb => {
    const path = trail.slice(0, depth);

    return {
      key: node ? node.key : 'all',
      label: node ? node.label : allLabel,
      href: hrefFor(path),
      selectedKey: trail[depth]?.key,
      options: optionsFor(node ? node.children : roots, path),
    };
  };

  return [crumb(null, 0), ...trail.map((node, depth) => crumb(node, depth + 1))];
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
