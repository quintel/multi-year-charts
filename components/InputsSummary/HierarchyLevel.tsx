import { ComponentProps } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid';

import Section from './Section';
import { LevelNode } from '../../utils/inputs/hierarchy';
import { stickyName } from '../../utils/inputs/layout';

interface HierarchyLevelProps {
  node: LevelNode;
  depth?: number;
  expandedKeys: string[];
  onToggle: (key: string) => void;
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

interface HeadingRowProps {
  depth: number;
  expanded: boolean;
  label: string;
  onToggle: () => void;
  valueColumns: number;
}

// The clickable heading which opens or closes a level
function HeadingRow({ depth, expanded, label, onToggle, valueColumns }: HeadingRowProps) {
  const Icon = expanded ? ChevronDownIcon : ChevronRightIcon;
  const { row, name } = classesFor(depth);

  return (
    <tr className={`cursor-pointer border-b border-b-gray-300 ${row}`} onClick={onToggle}>
      <th className={name}>
        <span dangerouslySetInnerHTML={{ __html: label }} />{' '}
        <Icon className="ml-0.5 -mr-1 inline-block h-5 w-5 align-middle" />
      </th>
      <td colSpan={valueColumns}></td>
    </tr>
  );
}

export default function HierarchyLevel({ node, depth = 0, ...level }: HierarchyLevelProps) {
  const expanded = level.expandedKeys.includes(node.key);

  return (
    <>
      <HeadingRow
        depth={depth}
        expanded={expanded}
        label={node.label}
        onToggle={() => level.onToggle(node.key)}
        valueColumns={level.valueColumns}
      />
      {expanded && node.slide && <Section slide={node.slide} {...level.slideProps} />}
      {expanded &&
        node.children.map((child) => (
          <HierarchyLevel key={child.key} node={child} depth={depth + 1} {...level} />
        ))}
    </>
  );
}
