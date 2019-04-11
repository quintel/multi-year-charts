import finalDemand from './charts/finalDemand';
import co2Emissions from './charts/co2Emissions';

export interface ChartSchema {
  key: string;
  series: string[];
}

export default [finalDemand, co2Emissions];
