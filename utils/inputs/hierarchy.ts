/** A slide in ETModel */
export interface Slide {
  path: string[];
  display_unit?: string | null;
  input_elements: {
    key: string;
    name: string;
    unit: string;
    display_unit?: string | null;
    group_name?: string | null;
    interface_group?: string | null;
  }[];
}

// A slide directly in a level, and whether it holds an edit
export interface SlideEntry {
  slide: Slide;
  edited: boolean;
}

export interface LevelNode {
  key: string;
  label: string;
  children: LevelNode[];
  slides: SlideEntry[];
  edited: boolean;
}

const LEVEL_SEPARATOR = ' → ';

const pathKey = (path: string[]) => path.join(LEVEL_SEPARATOR);

// Every segment but the last, which names the slide rather than a level
const groupingOf = (slide: Slide) => slide.path.slice(0, -1);

const findOrAdd = (nodes: LevelNode[], path: string[]): LevelNode => {
  const key = pathKey(path);
  const found = nodes.find((node) => node.key === key);

  if (found) return found;

  const added = { key, label: path[path.length - 1], children: [], slides: [], edited: false };
  nodes.push(added);

  return added;
};

// Walks the grouping segments, marking each as edited, and returns the level the slide sits in
const levelFor = (roots: LevelNode[], grouping: string[], edited: boolean): LevelNode => {
  let nodes = roots;
  let level!: LevelNode;

  grouping.forEach((_, index) => {
    level = findOrAdd(nodes, grouping.slice(0, index + 1));
    level.edited = level.edited || edited;
    nodes = level.children;
  });

  return level;
};

const addSlide = (roots: LevelNode[], slide: Slide, edited: boolean): LevelNode[] => {
  const grouping = groupingOf(slide);

  if (grouping.length > 0) {
    levelFor(roots, grouping, edited).slides.push({ slide, edited });
  }

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
export const slugOf = ({ label }: { label: string }) => {
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

export const visibleSlides = (entries: SlideEntry[], showAll: boolean) =>
  (showAll ? entries : entries.filter((entry) => entry.edited)).map((entry) => entry.slide);

export const scopeContents = (roots: LevelNode[], scope: string[], showAll: boolean) => {
  const trail = resolveScope(roots, scope);
  const scoped = trail[trail.length - 1];

  return {
    trail,
    slides: visibleSlides(scoped ? scoped.slides : [], showAll),
    levels: visibleLevels(scoped ? scoped.children : roots, showAll),
  };
};
