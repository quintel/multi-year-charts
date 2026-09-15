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
  edited: boolean;
}

const LEVEL_SEPARATOR = ' → ';
const GROUPING_DEPTH = 2;

const pathKey = (path: string[]) => path.join(LEVEL_SEPARATOR);

const findOrAdd = (nodes: LevelNode[], path: string[]): LevelNode => {
  const key = pathKey(path);
  const found = nodes.find((node) => node.key === key);

  if (found) return found;

  const added = { key, label: path[path.length - 1], children: [], edited: false };
  nodes.push(added);

  return added;
};

const leaf = (slide: Slide, edited: boolean): LevelNode => ({
  key: pathKey(slide.path),
  label: pathKey(slide.path.slice(GROUPING_DEPTH)),
  children: [],
  slide,
  edited,
});

const addSlide = (roots: LevelNode[], slide: Slide, edited: boolean): LevelNode[] => {
  const grouping = slide.path.slice(0, GROUPING_DEPTH);

  // Walking the grouping segments leaves us holding the children of the innermost group
  const siblings = grouping.reduce((nodes, _, index) => {
    const node = findOrAdd(nodes, grouping.slice(0, index + 1));
    node.edited = node.edited || edited;

    return node.children;
  }, roots);

  siblings.push(leaf(slide, edited));

  return roots;
};

// Groups the slides worth showing into the levels the table renders, marking those holding edits
export const buildHierarchy = (
  slides: Slide[],
  include: (slide: Slide) => boolean = () => true,
  isEdited: (slide: Slide) => boolean = () => false
): LevelNode[] =>
  slides
    .filter(include)
    .reduce((roots, slide) => addSlide(roots, slide, isEdited(slide)), [] as LevelNode[]);

// Slugs come from translated labels, so a URL built in one locale will not resolve in another
export const slugOf = ({ label }: LevelNode) => {
  const plain = label
    .replace(/<[^>]*>/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return plain.match(/[a-z0-9]+/g)?.join('-') ?? encodeURIComponent(plain.trim());
};

// Stops at the first slug naming no level, caller repairs the url
export const resolveScope = (roots: LevelNode[], scope: string[]): LevelNode[] => {
  const trail: LevelNode[] = [];

  for (const slug of scope) {
    const siblings = trail.length ? trail[trail.length - 1].children : roots;
    const found = siblings.find((node) => slugOf(node) === slug);

    if (!found) break;

    trail.push(found);
  }

  return trail;
};

export const visibleLevels = (nodes: LevelNode[], showAll: boolean) =>
  showAll ? nodes : nodes.filter((node) => node.edited);

export const scopeContents = (roots: LevelNode[], scope: string[], showAll: boolean) => {
  const trail = resolveScope(roots, scope);
  const scoped = trail[trail.length - 1];

  return {
    trail,
    slide: scoped && (showAll || scoped.edited) ? scoped.slide : undefined,
    levels: visibleLevels(scoped ? scoped.children : roots, showAll),
  };
};
