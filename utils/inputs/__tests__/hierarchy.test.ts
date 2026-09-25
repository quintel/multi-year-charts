import {
  buildHierarchy,
  resolveScope,
  scopeContents,
  slugOf,
  visibleSlides,
  Slide,
} from '../hierarchy';

const slide = (path: string[], keys: string[] = ['a']): Slide => ({
  path,
  input_elements: keys.map((key) => ({ key, name: key, unit: 'MW' })),
});

const slides = [
  slide(['Built environment', 'Heating', 'Households']),
  slide(['Built environment', 'Heating', 'Offices']),
  slide(['Industry', 'Steel', 'Blast furnaces']),
];

const nested = [
  slide(['Demand', 'Transport', 'Passenger transport', 'Cars']),
  slide(['Demand', 'Transport', 'Freight transport', 'Trucks']),
  slide(['Demand', 'Transport', 'Overview']),
  slide(['Demand', 'Households', 'Insulation']),
];

describe('slugOf', () => {
  const slugFor = (label: string) => slugOf({ label });

  it('lowercases and joins the words', () => {
    expect(slugFor('Built environment')).toEqual('built-environment');
  });

  it('strips the markup a label may carry', () => {
    expect(slugFor('CO<sub>2</sub> emissions')).toEqual('co2-emissions');
  });

  it('folds accents rather than dropping the letters', () => {
    expect(slugFor('Financiën')).toEqual('financien');
  });

  it('falls back to the label when it has no alphanumerics', () => {
    expect(slugFor('→')).toEqual(encodeURIComponent('→'));
  });
});

describe('buildHierarchy', () => {
  it('groups the slides under every segment but the last', () => {
    const [built] = buildHierarchy(slides);

    expect(built.label).toEqual('Built environment');
    expect(built.children.map((node) => node.label)).toEqual(['Heating']);
    expect(built.children[0].slides.map((entry) => entry.slide.path[2])).toEqual([
      'Households',
      'Offices',
    ]);
  });

  it('leaves the slides as content rather than as levels of their own', () => {
    const [built] = buildHierarchy(slides);

    expect(built.children[0].children).toEqual([]);
  });

  it('gives a nested sidebar item a level of its own', () => {
    const [demand] = buildHierarchy(nested);
    const transport = demand.children.find((node) => node.label === 'Transport');

    expect(demand.children.map((node) => node.label)).toEqual(['Transport', 'Households']);
    expect(transport?.children.map((node) => node.label)).toEqual([
      'Passenger transport',
      'Freight transport',
    ]);
  });

  it('lets a level hold its own slides and its children at once', () => {
    const [demand] = buildHierarchy(nested);
    const transport = demand.children[0];

    expect(transport.slides.map((entry) => entry.slide.path[2])).toEqual(['Overview']);
    expect(transport.children).toHaveLength(2);
  });

  it('marks a level as edited when any slide below it is', () => {
    const [built, industry] = buildHierarchy(
      slides,
      () => true,
      (each) => each.path.includes('Offices')
    );

    expect(built.edited).toBe(true);
    expect(built.children[0].slides.map((entry) => entry.edited)).toEqual([false, true]);
    expect(industry.edited).toBe(false);
  });

  it('marks every level above an edited slide, however deep', () => {
    const [demand] = buildHierarchy(
      nested,
      () => true,
      (each) => each.path.includes('Cars')
    );

    expect(demand.edited).toBe(true);
    expect(demand.children[0].edited).toBe(true);
    expect(demand.children[0].children[0].edited).toBe(true);
    expect(demand.children[0].children[1].edited).toBe(false);
  });

  it('leaves out the slides the filter rejects', () => {
    const built = buildHierarchy(slides, (each) => !each.path.includes('Industry'));

    expect(built.map((node) => node.label)).toEqual(['Built environment']);
  });
});

describe('visibleSlides', () => {
  const entries = [
    { slide: slides[0], edited: false },
    { slide: slides[1], edited: true },
  ];

  it('keeps every slide when showing all', () => {
    expect(visibleSlides(entries, true)).toHaveLength(2);
  });

  it('keeps only the edited slides otherwise', () => {
    expect(visibleSlides(entries, false)).toEqual([slides[1]]);
  });
});

describe('resolveScope', () => {
  const roots = buildHierarchy(slides);

  it('walks the slugs down the tree', () => {
    expect(resolveScope(roots, ['built-environment', 'heating']).map(slugOf)).toEqual([
      'built-environment',
      'heating',
    ]);
  });

  it('stops at the first slug naming no level', () => {
    expect(resolveScope(roots, ['built-environment', 'nonsense', 'heating']).map(slugOf)).toEqual([
      'built-environment',
    ]);
  });

  it('walks the extra level a nested sidebar item adds', () => {
    const roots = buildHierarchy(nested);

    expect(resolveScope(roots, ['demand', 'transport', 'passenger-transport']).map(slugOf)).toEqual(
      ['demand', 'transport', 'passenger-transport']
    );
  });
});

describe('scopeContents', () => {
  const roots = buildHierarchy(
    slides,
    () => true,
    (each) => each.path.includes('Offices')
  );

  it('returns the children of the scoped level', () => {
    const { levels } = scopeContents(roots, ['built-environment'], true);

    expect(levels.map((node) => node.label)).toEqual(['Heating']);
  });

  it('returns the roots when the scope is empty', () => {
    const { levels } = scopeContents(roots, [], true);

    expect(levels.map((node) => node.label)).toEqual(['Built environment', 'Industry']);
  });

  it('keeps only the edited levels when not showing all', () => {
    const { levels } = scopeContents(roots, [], false);

    expect(levels.map((node) => node.label)).toEqual(['Built environment']);
  });

  it('gives the slides the scoped level holds', () => {
    const { slides: scoped } = scopeContents(roots, ['built-environment', 'heating'], true);

    expect(scoped.map((each) => each.path[2])).toEqual(['Households', 'Offices']);
  });

  it('withholds the unedited slides when not showing all', () => {
    const { slides: scoped } = scopeContents(roots, ['built-environment', 'heating'], false);

    expect(scoped.map((each) => each.path[2])).toEqual(['Offices']);
  });

  it('gives no slides at the root, where only levels live', () => {
    const { slides: scoped } = scopeContents(roots, [], true);

    expect(scoped).toEqual([]);
  });

  it('reports the trail it could resolve, so the caller can repair the URL', () => {
    const { trail, levels } = scopeContents(roots, ['built-environment', 'nonsense'], true);

    expect(trail.map(slugOf)).toEqual(['built-environment']);
    expect(levels.map((node) => node.label)).toEqual(['Heating']);
  });
});
