import { ComponentProps } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/solid';

import Section from './Section';
import Markup from '../Markup';
import { LevelNode, slugOf, visibleLevels } from '../../utils/inputs/hierarchy';
import { stickyName } from '../../utils/inputs/layout';
import { withAllInputs } from '../../utils/inputs/urls';
import useLinkHelper from '../../utils/useLinkHelper';

interface HierarchyLevelProps {
  node: LevelNode;
  depth: number;
  path: string;
  showAll: boolean;
  slideProps: Omit<ComponentProps<typeof Section>, 'slide'>;
  valueColumns: number;
}

//  One entry per level, outermost first. A level deeper than these repeats the innermost
const LEVEL_CLASSES = [
  { row: '', name: `${stickyName} p-2 text-left font-semibold` },
  { row: '', name: `${stickyName} p-2 pl-8 text-left font-semibold text-gray-600` },
  {
    row: 'bg-gray-100',
    name: 'sticky left-0 bg-gray-100 p-2 pl-8 text-left font-normal text-gray-600',
  },
];

const classesFor = (depth: number) => LEVEL_CLASSES[Math.min(depth, LEVEL_CLASSES.length - 1)];

function HeadingRow({
  depth,
  href,
  label,
  valueColumns,
}: {
  depth: number;
  href: string;
  label: string;
  valueColumns: number;
}) {
  const { row, name } = classesFor(depth);

  return (
    <tr className={`border-b border-b-gray-300 ${row}`}>
      <th className={name}>
        <Link href={href} className="hover:underline">
          <Markup>{label}</Markup>{' '}
          <ChevronRightIcon className="ml-0.5 -mr-1 inline-block h-5 w-5 align-middle" />
        </Link>
      </th>
      <td colSpan={valueColumns}></td>
    </tr>
  );
}

export default function HierarchyLevel({ node, depth, path, ...level }: HierarchyLevelProps) {
  const { linkTo } = useLinkHelper();
  const href = `${path}/${slugOf(node)}`;

  return (
    <>
      <HeadingRow
        depth={depth}
        href={linkTo(withAllInputs(href, level.showAll))}
        label={node.label}
        valueColumns={level.valueColumns}
      />
      {node.slide && <Section slide={node.slide} {...level.slideProps} />}
      {visibleLevels(node.children, level.showAll).map((child) => (
        <HierarchyLevel key={child.key} node={child} depth={depth + 1} path={href} {...level} />
      ))}
    </>
  );
}
