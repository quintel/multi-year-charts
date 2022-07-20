/**
 * Given the window pathname, extracts the list of scenario IDs to be shown in
 * the interface.
 */
export default (pathname: string): number[] => {
  const commaSeparated = pathname.split('/')[1];

  if (!commaSeparated) {
    return [];
  }

  const ids = commaSeparated.split(',').map(id => parseInt(id, 10));

  if (ids.some(isNaN)) {
    return [];
  }

  return ids;
};
