import co2Emissions from './charts/co2Emissions';
import finalDemand from './charts/finalDemand';
import renewables from './charts/renewables';

export interface ChartSchema {
  key: string;
  slug: string;
  variants: {
    key: string;
    slug: string;
    series: string[];
    displayAs?: 'chart' | 'table';
  }[];
}

export interface FlattenedChartSchema {
  key: string;
  chartKey: string;
  variantKey: string;
  slug: string;
  series: string[];
  displayAs: 'chart' | 'table';
}

export default [finalDemand, co2Emissions, renewables];
