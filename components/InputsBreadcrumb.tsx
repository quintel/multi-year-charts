import Breadcrumb, { Crumb } from './Breadcrumb';

import { LevelNode, visibleLevels } from '../utils/inputs/hierarchy';
import { scopePath, withAllInputs } from '../utils/inputs/urls';
import useTranslate from '../utils/useTranslate';

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
  const hrefFor = (nodes: LevelNode[]) => withAllInputs(scopePath(nodes), showAll);

  // Each crumb lists the levels below it
  const crumb = (node: LevelNode | null, depth: number): Crumb => {
    const path = trail.slice(0, depth);

    return {
      key: node ? node.key : 'all',
      label: node ? node.label : translate('inputs.all'),
      href: hrefFor(path),
      selectedKey: trail[depth]?.key,
      options: visibleLevels(node ? node.children : roots, showAll).map((child) => ({
        key: child.key,
        label: child.label,
        href: hrefFor([...path, child]),
      })),
    };
  };

  const crumbs = [crumb(null, 0), ...trail.map((node, depth) => crumb(node, depth + 1))];

  return <Breadcrumb crumbs={crumbs} />;
}
