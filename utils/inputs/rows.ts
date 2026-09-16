import { LevelNode, Slide, visibleLevels, visibleSlides } from './hierarchy';
import { renderableInputs } from './visibility';
import { EditableColumn } from './access';
import { ScenarioIndexedInputData } from '../api/types';

type InputElement = Slide['input_elements'][number];

// The share group one column is working on
export interface Selection {
  sessionID: number;
  shareGroup: string;
}

export type TableRow =
  | { kind: 'level'; key: string; depth: number; label: string }
  | { kind: 'slide'; key: string; depth: number; label: string }
  | { kind: 'group'; key: string; depth: number; label: string; unitQualifier?: string }
  | { kind: 'input'; key: string; depth: number; input: InputElement }
  | { kind: 'total'; key: string; depth: number; group: string };

export interface FlattenOptions {
  columns: EditableColumn[];
  held: Record<number, Set<string>>;
  inputData: ScenarioIndexedInputData;
  levels: LevelNode[];
  selection: Selection | null;
  showAll: boolean;
  slides: Slide[];
}

// A heading says nothing past the unit column, but keeps a cell in each of the first three
export const spanFor = (row: TableRow, columnIndex: number, columnCount: number) => {
  if (row.kind === 'input' || row.kind === 'total') return {};
  if (columnIndex < 3) return {};

  return columnIndex === 3 ? { colSpan: columnCount - 3 } : { colSpan: 0 };
};

const slideKey = (slide: Slide) => slide.path.join('/');

const slideLabel = (slide: Slide) => slide.path[slide.path.length - 1];

// The group an element belongs to
const groupIdOf = (element?: InputElement) => element?.interface_group || undefined;

// A total shows while its group is being worked on, or while the interface is holding its values
const showsTotal = (group: string, options: FlattenOptions) => {
  const { columns, held, selection } = options;

  if (!columns.some((column) => column.editable)) return false;
  if (selection?.shareGroup === group) return true;

  return columns.some(({ sessionID }) => held[sessionID]?.has(group));
};

/**
 * The heading row for a slide, then a row per input, with a header where a share group opens and a
 * total where one closes
 *
 * A slide's elements are ordered by position, so one group can open more than once. Keying the
 * heading and the total on the element that opens or closes the run keeps every key unique
 */
function slideRows(slide: Slide, depth: number, options: FlattenOptions): TableRow[] {
  const { columns, inputData } = options;
  const elements = renderableInputs(slide.input_elements, inputData, columns);
  const groupIn = (element?: InputElement) =>
    element && inputData[columns[0].sessionID][element.key]?.share_group;

  if (elements.length === 0) return [];

  const rows: TableRow[] = [
    { kind: 'slide', key: slideKey(slide), depth, label: slideLabel(slide) },
  ];

  const slideQualifier = slide.display_unit || undefined;
  let slideQualifierPending = slideQualifier !== undefined;

  elements.forEach((element, index) => {
    const previous = elements[index - 1];
    const next = elements[index + 1];
    const groupId = groupIdOf(element);
    const shared = groupIn(element);
    const label = element.group_name || '';
    const unitQualifier = element.display_unit || undefined;

    // A group with neither a name nor a qualifier has nothing to say, so it draws no heading
    if (groupId && groupId !== groupIdOf(previous) && (label || unitQualifier)) {
      rows.push({
        kind: 'group',
        key: `${slideKey(slide)}/${element.key}/group`,
        depth: depth + 1,
        label,
        unitQualifier,
      });
    }

    if (!groupId && slideQualifierPending) {
      rows.push({
        kind: 'group',
        key: `${slideKey(slide)}/${element.key}/qualifier`,
        depth: depth + 1,
        label: '',
        unitQualifier: slideQualifier,
      });

      slideQualifierPending = false;
    }

    rows.push({
      kind: 'input',
      key: `${slideKey(slide)}/${element.key}`,
      depth: depth + (groupId || shared ? 2 : 1),
      input: element,
    });

    if (shared && shared !== groupIn(next) && showsTotal(shared, options)) {
      rows.push({
        kind: 'total',
        key: `${slideKey(slide)}/${element.key}/total`,
        depth: depth + 2,
        group: shared,
      });
    }
  });

  return rows;
}

function levelRows(node: LevelNode, depth: number, options: FlattenOptions): TableRow[] {
  const own = visibleSlides(node.slides, options.showAll).flatMap((slide) =>
    slideRows(slide, depth + 1, options)
  );
  const below = visibleLevels(node.children, options.showAll).flatMap((child) =>
    levelRows(child, depth + 1, options)
  );

  // A heading with nothing under it names a level the reader cannot act on
  if (own.length === 0 && below.length === 0) return [];

  return [{ kind: 'level', key: node.key, depth, label: node.label }, ...own, ...below];
}

export function flattenRows(options: FlattenOptions): TableRow[] {
  const own = options.slides.flatMap((slide) => slideRows(slide, 0, options));
  const below = options.levels.flatMap((level) => levelRows(level, 0, options));

  return [...own, ...below];
}
