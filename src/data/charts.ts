import co2Emissions from './charts/co2Emissions';
import finalDemand from './charts/finalDemand';
import renewables from './charts/renewables';

export interface ChartSchema {
  key: string;
  slug: string;
  series: string[];
}

export default [finalDemand, co2Emissions, renewables];
