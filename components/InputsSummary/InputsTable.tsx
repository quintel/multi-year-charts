import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import InputsBreadcrumb from '../InputsBreadcrumb';
import Markup from '../Markup';
import { InputName, InputDefault, InputValueCell, NOT_EDITING } from './Row';
import { TotalName, TotalValue } from './GroupTotalRow';

import {
  InputValue,
  ScenarioIndexedInputData,
  ScenarioIndexedScenarioData,
} from '../../utils/api/types';
import { ColumnEditing } from '../../store/types';
import { EditableColumn } from '../../utils/inputs/access';
import { buildHierarchy, scopeContents, Slide } from '../../utils/inputs/hierarchy';
import { flattenRows, spanFor, Selection, TableRow } from '../../utils/inputs/rows';
import { heldGroups } from '../../utils/inputs/shareGroups';
import {
  breadcrumbHeight,
  indentFor,
  nameColumnWidth,
  tableWidth,
  valueColumnWidth,
} from '../../utils/inputs/layout';
import { scopePath, showingAllInputs, withAllInputs } from '../../utils/inputs/urls';
import { displayUnit } from '../../utils/inputs/vocabulary';
import { hasEdits, hasRows } from '../../utils/inputs/visibility';
import useLinkHelper from '../../utils/useLinkHelper';
import useTranslate from '../../utils/useTranslate';
import { useNavHeight } from '../../utils/useNavHeight';

interface InputsTableProps {
  columns: EditableColumn[];
  editing: Record<number, ColumnEditing>;
  inputs: ScenarioIndexedInputData;
  scenarios: ScenarioIndexedScenarioData;
  inputList: Slide[];
  onCommitValue: (sessionID: number, inputKey: string, value: InputValue) => void;
  onResetValue: (sessionID: number, inputKey: string) => void;
  openModal: (scenarioID: number, inputKey?: string) => void;
}

type HeadingRow = Extract<TableRow, { kind: 'level' | 'slide' | 'group' }>;

// Depth sets the indent for every row kind; kind and depth together set the type
// I guess hereeee
const headingClass = (row: HeadingRow) => {
  if (row.kind === 'level') {
    return row.depth === 0
      ? 'text-xs font-semibold uppercase tracking-wide text-gray-500'
      : 'font-semibold text-myetm-800';
  }

  return row.kind === 'slide' ? 'font-medium text-myetm-800' : 'text-gray-600';
};

function HeadingCell({ row }: { row: HeadingRow }) {
  return (
    <span className={`block ${headingClass(row)}`} style={{ paddingLeft: indentFor(row.depth) }}>
      <Markup>{row.label}</Markup>
    </span>
  );
}

// Sits over the unit column it qualifies, as in etmodel
function UnitQualifier({ row }: { row: TableRow }) {
  if (row.kind !== 'group' || !row.unitQualifier) return null;

  return <span className="text-xs font-normal text-gray-500">{row.unitQualifier}</span>;
}

const rowClassName = (row: TableRow) => {
  if (row.kind === 'input' || row.kind === 'total') return 'inputs-row';

  // A slide only has a heading-top row above it when depth > 0), we have to adjust for sticky
  // header rows
  if (row.kind === 'slide') {
    return row.depth > 0
      ? 'inputs-heading inputs-heading-slide inputs-heading-slide--under-top'
      : 'inputs-heading inputs-heading-slide';
  }

  if (row.kind === 'level' && row.depth === 0) return 'inputs-heading inputs-heading-top';

  return 'inputs-heading inputs-heading-group';
};

const InputsTable: React.FC<InputsTableProps> = ({
  columns,
  editing,
  inputs,
  scenarios,
  inputList,
  onCommitValue,
  onResetValue,
  openModal,
}) => {
  const router = useRouter();
  const translate = useTranslate();
  const { linkTo } = useLinkHelper();
  const navHeight = useNavHeight();
  const [selection, setSelection] = useState<Selection | null>(null);
  const showAllInputs = showingAllInputs(router.query);
  const scopeKey = [router.query.scope].flat().filter(Boolean).join('/');
  const scope = useMemo(() => (scopeKey ? scopeKey.split('/') : []), [scopeKey]);

  const userValues = useMemo(
    () =>
      Object.fromEntries(
        columns.map(({ sessionID }) => [sessionID, scenarios[sessionID].userValues || {}])
      ),
    [columns, scenarios]
  );

  // A closed group is 'held' until it totals 100
  const held = useMemo(
    () =>
      Object.fromEntries(
        columns.map(({ sessionID }) => [
          sessionID,
          heldGroups(inputs[sessionID], editing[sessionID]?.values ?? {}, userValues[sessionID]),
        ])
      ),
    [columns, inputs, editing, userValues]
  );

  // Columns are already in display order, because the reducer derives the scenario list from them
  const columnScenarios = useMemo(
    () => columns.map(({ sessionID }) => scenarios[sessionID].scenario),
    [columns, scenarios]
  );

  const structure = useMemo(
    () =>
      buildHierarchy(
        inputList,
        (slide) => hasRows(slide.input_elements, inputs, columns),
        (slide) => hasEdits(slide.input_elements, inputs)
      ),
    [inputList, inputs, columns]
  );

  const { trail, slides, levels } = useMemo(
    () => scopeContents(structure, scope, showAllInputs),
    [structure, scope, showAllInputs]
  );

  const rows = useMemo(
    () =>
      flattenRows({
        columns,
        held,
        inputData: inputs,
        levels,
        selection,
        showAll: showAllInputs,
        slides,
      }),
    [columns, held, inputs, levels, selection, showAllInputs, slides]
  );

  const resolvedHref = linkTo(withAllInputs(scopePath(trail), showAllInputs));
  const unresolved = structure.length > 0 && trail.length < scope.length;

  // A slug naming no level, from a stale link or a locale switch, drops back to the nearest level
  useEffect(() => {
    if (unresolved) {
      router.replace(resolvedHref);
    }
  }, [router, unresolved, resolvedHref]);

  const tableColumns = useMemo<ColumnsType<TableRow>>(() => {
    const count = columns.length + 3;
    const cellFor = (index: number) => (row: TableRow) => spanFor(row, index, count);

    return [
      {
        key: 'name',
        title: translate('inputs.name'),
        width: nameColumnWidth,
        onCell: cellFor(0),
        render: (_: unknown, row: TableRow) => {
          if (row.kind === 'input') return <InputName input={row.input} depth={row.depth} />;

          if (row.kind === 'total') {
            return (
              <TotalName
                columns={columns}
                depth={row.depth}
                editing={editing}
                group={row.group}
                inputData={inputs}
                translate={translate}
              />
            );
          }

          return <HeadingCell row={row} />;
        },
      },
      {
        key: 'unit',
        title: translate('inputs.unit'),
        align: 'right',
        width: valueColumnWidth,
        onCell: cellFor(1),
        render: (_: unknown, row: TableRow) =>
          row.kind === 'input' ? (
            displayUnit(inputs[columns[0].sessionID][row.input.key].unit, row.input.unit)
          ) : (
            <UnitQualifier row={row} />
          ),
      },
      {
        key: 'default',
        title: columnScenarios[0].startYear,
        align: 'right',
        width: valueColumnWidth,
        onCell: cellFor(2),
        render: (_: unknown, row: TableRow) =>
          row.kind === 'input' ? (
            <InputDefault
              source={inputs[columns[0].sessionID][row.input.key]}
              translate={translate}
            />
          ) : null,
      },
      ...columns.map((column, index) => ({
        key: `scenario-${column.sessionID}`,
        align: 'right' as const,
        width: valueColumnWidth,
        onCell: cellFor(index + 3),
        title: (
          <button
            type="button"
            aria-label="Open scenario in pop up"
            title="Open scenario in pop up"
            onClick={() => openModal(column.sessionID)}
            className="-mx-2 -my-1 cursor-pointer rounded px-2 py-1 text-myetm-800 bg-myetm-300 hover:bg-myetm-990 hover:text-myetm-200 active:bg-gray-200 active:text-midnight-900"
          >
            {columnScenarios[index].endYear}
          </button>
        ),
        render: (_: unknown, row: TableRow) => {
          if (row.kind === 'total') {
            return (
              <TotalValue
                column={column}
                editing={editing[column.sessionID] || NOT_EDITING}
                group={row.group}
                held={held[column.sessionID]}
                inputs={inputs[column.sessionID]}
                translate={translate}
              />
            );
          }

          if (row.kind !== 'input') return null;

          return (
            <InputValueCell
              column={column}
              editing={editing[column.sessionID] || NOT_EDITING}
              held={held[column.sessionID]}
              input={row.input}
              inputs={inputs[column.sessionID]}
              onCommit={(value) => onCommitValue(column.sessionID, row.input.key, value)}
              onReset={() => onResetValue(column.sessionID, row.input.key)}
              onSelect={setSelection}
              selection={selection}
              translate={translate}
              userValues={userValues[column.sessionID]}
            />
          );
        },
      })),
    ];
  }, [
    columns,
    columnScenarios,
    editing,
    held,
    inputs,
    onCommitValue,
    onResetValue,
    openModal,
    selection,
    translate,
    userValues,
  ]);

  // Wider than the viewport the table overflows to the right, narrower the auto margins centre it
  return (
    <div className="mx-auto w-fit">
      <div className="inputs-breadcrumb sticky z-30 flex items-center bg-white">
        <InputsBreadcrumb roots={structure} showAll={showAllInputs} trail={trail} />
      </div>

      <Table<TableRow>
        columns={tableColumns}
        dataSource={rows}
        rowKey="key"
        rowClassName={rowClassName}
        size="small"
        pagination={false}
        sticky={{ offsetHeader: navHeight + breadcrumbHeight }}
        locale={{ emptyText: translate('inputs.none') }}
        style={{ width: tableWidth(columns.length) }}
      />
    </div>
  );
};

export default InputsTable;
