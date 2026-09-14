
const NAME_CHARS = 39;
const NAME_INDENT = '3.5rem';
const VALUE_CHARS = 8;
const MAX_VALUE_CHARS = 13;
const VALUE_PADDING = '1rem';

export const nameColumnWidth = `calc(${NAME_CHARS}ch + ${NAME_INDENT})`;
export const valueColumnWidth = `calc(${VALUE_CHARS}ch + ${VALUE_PADDING})`;
export const valueColumnCount = (scenarioCount: number) => scenarioCount + 2;
// Keeps a row identifiable while the table is scrolled sideways for small screens
export const stickyName = 'sticky left-0 bg-white';

const tableWidth = (scenarioCount: number, columnWidth: string) =>
  `calc(${nameColumnWidth} + ${valueColumnCount(scenarioCount)} * ${columnWidth})`;

// The width below which the table scrolls sideways
export const minTableWidth = (scenarioCount: number) =>
  tableWidth(scenarioCount, valueColumnWidth);

// The width above which a value column is spacing so the table centres instead
export const maxTableWidth = (scenarioCount: number) =>
  tableWidth(scenarioCount, `calc(${MAX_VALUE_CHARS}ch + ${VALUE_PADDING})`);
