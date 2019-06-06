export default {
  key: 'co2_emissions',
  slug: 'co2-emissions',
  variants: [
    {
      key: 'by_sector',
      slug: 'by-sector',
      series: [
        'myc_primary_co2_in_agriculture',
        'myc_primary_co2_in_buildings',
        'myc_primary_co2_in_households',
        'myc_primary_co2_in_industry',
        'myc_primary_co2_in_other_and_energy_sector',
        'myc_primary_co2_in_transport'
      ]
    },
    {
      key: 'by_carrier',
      slug: 'by-carrier',
      series: [
        'myc_primary_co2_final_demand_of_coal_and_derivatives',
        'myc_primary_co2_final_demand_of_electricity',
        'myc_primary_co2_final_demand_of_heat',
        'myc_primary_co2_final_demand_of_hydrogen',
        'myc_primary_co2_final_demand_of_natural_gas_and_derivatives',
        'myc_primary_co2_final_demand_of_oil_and_derivatives'
      ]
    },
    {
      key: 'by_sector_and_carrier',
      slug: 'by-sector-and-carrier',
      displayAs: 'table',
      series: [
        'myc_primary_co2_of_coal_and_derivatives_in_agriculture',
        'myc_primary_co2_of_coal_and_derivatives_in_buildings',
        'myc_primary_co2_of_coal_and_derivatives_in_bunkers',
        'myc_primary_co2_of_coal_and_derivatives_in_energy_and_other',
        'myc_primary_co2_of_coal_and_derivatives_in_households',
        'myc_primary_co2_of_coal_and_derivatives_in_industry',
        'myc_primary_co2_of_coal_and_derivatives_in_transport',
        'myc_primary_co2_of_electricity_in_agriculture',
        'myc_primary_co2_of_electricity_in_buildings',
        'myc_primary_co2_of_electricity_in_bunkers',
        'myc_primary_co2_of_electricity_in_energy_and_other',
        'myc_primary_co2_of_electricity_in_households',
        'myc_primary_co2_of_electricity_in_industry',
        'myc_primary_co2_of_electricity_in_transport',
        'myc_primary_co2_of_heat_in_agriculture',
        'myc_primary_co2_of_heat_in_buildings',
        'myc_primary_co2_of_heat_in_bunkers',
        'myc_primary_co2_of_heat_in_energy_and_other',
        'myc_primary_co2_of_heat_in_households',
        'myc_primary_co2_of_heat_in_industry',
        'myc_primary_co2_of_heat_in_transport',
        'myc_primary_co2_of_hydrogen_in_agriculture',
        'myc_primary_co2_of_hydrogen_in_buildings',
        'myc_primary_co2_of_hydrogen_in_bunkers',
        'myc_primary_co2_of_hydrogen_in_energy_and_other',
        'myc_primary_co2_of_hydrogen_in_households',
        'myc_primary_co2_of_hydrogen_in_industry',
        'myc_primary_co2_of_hydrogen_in_transport',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_agriculture',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_buildings',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_bunkers',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_energy_and_other',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_households',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_industry',
        'myc_primary_co2_of_natural_gas_and_derivatives_in_transport',
        'myc_primary_co2_of_oil_and_derivatives_in_agriculture',
        'myc_primary_co2_of_oil_and_derivatives_in_buildings',
        'myc_primary_co2_of_oil_and_derivatives_in_bunkers',
        'myc_primary_co2_of_oil_and_derivatives_in_energy_and_other',
        'myc_primary_co2_of_oil_and_derivatives_in_households',
        'myc_primary_co2_of_oil_and_derivatives_in_industry',
        'myc_primary_co2_of_oil_and_derivatives_in_transport'
      ]
    }
  ]
};
