import co2Emissions from './charts/co2Emissions';
import finalDemand from './charts/finalDemand';
import renewables from './charts/renewables';
import installedProductionCapacity from './charts/installedProductionCapacity';
import flexibleCapacity from './charts/flexibleCapacity';
import primaryDemand from './charts/primaryDemand';

// A node in a chart's variant tree. `series` makes it directly renderable (a chart lives at its
// own path); `children` makes it drillable further. A node may be neither, either, or both — e.g.
// "By carrier" renders its own combined chart *and* breaks down further per sector underneath it.
export interface VariantNode {
  key: string;
  slug: string;
  series?: string[];
  displayAs?: 'chart' | 'table';
  children?: VariantNode[];
}

export interface ChartSchema {
  key: string;
  slug: string;
  variants: VariantNode[];
}

export interface FlattenedChartSchema {
  key: string;
  chartKey: string;
  variantKey: string;
  // Every node's key from the top of the variant tree down to the resolved leaf, e.g.
  // ['by_sector', 'by_sector_households']
  variantPath: string[];
  slug: string;
  series: string[];
  displayAs: 'chart' | 'table';
  hasVariants: boolean;
}

export default [finalDemand, co2Emissions, renewables, flexibleCapacity, primaryDemand, installedProductionCapacity];
