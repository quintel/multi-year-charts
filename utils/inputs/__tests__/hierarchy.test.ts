import {
  buildHierarchy,
  resolveScope,
  scopeContents,
  slugOf,
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

describe('slugOf', () => {
  const slugFor = (label: string) => slugOf({ key: label, label, children: [], edited: false });

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
  it('nests the slides under their grouping segments', () => {
    const [built] = buildHierarchy(slides);

    expect(built.label).toEqual('Built environment');
    expect(built.children.map((node) => node.label)).toEqual(['Heating']);
    expect(built.children[0].children.map((node) => node.label)).toEqual(['Households', 'Offices']);
  });

  it('marks a level as edited when any slide below it is', () => {
    const [built, industry] = buildHierarchy(
      slides,
      () => true,
      (each) => each.path.includes('Offices')
    );

    expect(built.edited).toBe(true);
    expect(built.children[0].children.map((node) => node.edited)).toEqual([false, true]);
    expect(industry.edited).toBe(false);
  });

  it('leaves out the slides the filter rejects', () => {
    const built = buildHierarchy(slides, (each) => !each.path.includes('Industry'));

    expect(built.map((node) => node.label)).toEqual(['Built environment']);
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

  it('gives the scoped slide when the level holds one', () => {
    const { slide: scoped } = scopeContents(
      roots,
      ['built-environment', 'heating', 'offices'],
      true
    );

    expect(scoped?.path).toEqual(['Built environment', 'Heating', 'Offices']);
  });

  it('withholds an unedited slide when not showing all', () => {
    const { slide: scoped } = scopeContents(
      roots,
      ['built-environment', 'heating', 'households'],
      false
    );

    expect(scoped).toBeUndefined();
  });

  it('reports the trail it could resolve, so the caller can repair the URL', () => {
    const { trail, levels } = scopeContents(roots, ['built-environment', 'nonsense'], true);

    expect(trail.map(slugOf)).toEqual(['built-environment']);
    expect(levels.map((node) => node.label)).toEqual(['Heating']);
  });
});
