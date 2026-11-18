// Number of residences, broken down per type or per construction period. Drilling into a type
// shows its construction periods; drilling into a period shows its types. Uses the
// number_of_* queries in gqueries/general/number_of_units.
import { ChartSchema, VariantNode } from '../charts';

const TYPES = ['apartments', 'detached_houses', 'semi_detached_houses', 'terraced_houses'];
// Series run oldest to newest; the period menu lists them newest first
const PERIODS = ['before_1945', '1945_1964', '1965_1984', '1985_2004', '2005_present', 'future'];

const slug = (key: string) => key.replace(/_/g, '-');

const breakdown = (
  key: string,
  overview: string[],
  members: string[],
  series: (member: string) => string[]
): VariantNode => ({
  key: `residences_per_${key}`,
  slug: `per-${key}`,
  children: [
    { key: `residences_${key}_all`, slug: 'all', series: overview },
    ...members.map((member) => ({
      key: `residences_${key}_${member}`,
      slug: slug(member),
      series: series(member),
    })),
  ],
});

const chart: ChartSchema = {
  key: 'number_of_residences',
  slug: 'number-of-residences',
  variants: [
    breakdown(
      'type',
      TYPES.map((type) => `number_of_${type}`),
      TYPES,
      (type) => PERIODS.map((period) => `number_of_${type}_${period}`)
    ),
    breakdown(
      'period',
      PERIODS.map((period) => `number_of_residences_${period}`),
      [...PERIODS].reverse(),
      (period) => TYPES.map((type) => `number_of_${type}_${period}`)
    ),
  ],
};

export default chart;
