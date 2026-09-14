/** A slide in ETModel */
export interface Slide {
  path: string[];
  input_elements: { key: string; name: string; unit: string; group_name?: string }[];
}

export interface LevelNode {
  key: string;
  label: string;
  children: LevelNode[];
  slide?: Slide;
}

const LEVEL_SEPARATOR = ' → ';
const GROUPING_DEPTH = 2;

export const LEVEL_COUNT = GROUPING_DEPTH + 1;

// The form the URL state uses
export const pathKey = (path: string[]) => path.join(LEVEL_SEPARATOR);

const findOrAdd = (nodes: LevelNode[], path: string[]): LevelNode => {
  const key = pathKey(path);
  const found = nodes.find((node) => node.key === key);

  if (found) return found;

  const added = { key, label: path[path.length - 1], children: [] };
  nodes.push(added);

  return added;
};

const addSlide = (roots: LevelNode[], slide: Slide): LevelNode[] => {
  const grouping = slide.path.slice(0, GROUPING_DEPTH);

  // Walking the grouping segments leaves us holding the children of the innermost group
  const siblings = grouping.reduce(
    (nodes, _, index) => findOrAdd(nodes, grouping.slice(0, index + 1)).children,
    roots
  );

  siblings.push({
    key: pathKey(slide.path),
    label: pathKey(slide.path.slice(GROUPING_DEPTH)),
    children: [],
    slide,
  });

  return roots;
};


// Groups the slides worth showing into the levels the table renders
export const buildHierarchy = (
  slides: Slide[],
  shouldShow: (slide: Slide) => boolean = () => true
): LevelNode[] => slides.filter(shouldShow).reduce(addSlide, [] as LevelNode[]);

// Every key in the tree, for expand all
export const allKeys = (nodes: LevelNode[]): string[] =>
  nodes.flatMap((node) => [node.key, ...allKeys(node.children)]);

const keyDepth = (key: string) => key.split(LEVEL_SEPARATOR).length;

export const keysByLevel = (keys: string[], levels: number = LEVEL_COUNT): string[][] => {
  const byLevel: string[][] = Array.from({ length: levels }, () => []);
  keys.forEach((key) => byLevel[Math.min(keyDepth(key), levels) - 1].push(key));
  return byLevel;
};

const slidesIn = (node: LevelNode): Slide[] =>
  node.slide ? [node.slide] : node.children.flatMap(slidesIn);

// Slides indexed by category and subcategory name
export const groupedByName = (roots: LevelNode[]): Record<string, Record<string, Slide[]>> =>
  Object.fromEntries(
    roots.map(({ label, children }) => [
      label,
      Object.fromEntries(children.map((child) => [child.label, slidesIn(child)])),
    ])
  );
