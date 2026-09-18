// Value columns are a fixed width, so switching scope reflows nothing
export const valueColumnWidth = 120;

// Fixed so the table has a natural width to centre at
export const nameColumnWidth = 480;

const valueColumnCount = (scenarioCount: number) => scenarioCount + 2;

// What the table wants to be
export const tableWidth = (scenarioCount: number) =>
  nameColumnWidth + valueColumnCount(scenarioCount) * valueColumnWidth;

// What antd's sticky header offsets itself by. Sync with globals.css --inputs-breadcrumb
export const breadcrumbHeight = 76;

// One step per level of the scoped tree, for every row kind
export const indentFor = (depth: number) => 0;
