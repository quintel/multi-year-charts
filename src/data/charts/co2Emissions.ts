export default {
  key: 'co2_emissions',
  slug: 'co2-emissions',
  variants: [
    {
      key: 'by_sector',
      slug: 'by-sector',
      series: [
        'primary_co2_final_demand_in_agriculture',
        'primary_co2_final_demand_in_buildings',
        'primary_co2_final_demand_in_households',
        'primary_co2_final_demand_in_industry',
        'primary_co2_final_demand_in_other_and_energy_sector',
        'primary_co2_final_demand_in_transport'
      ]
    },
    {
      key: 'by_carrier',
      slug: 'by-carrier',
      series: [
        'primary_co2_final_demand_of_coal_and_derivatives',
        'primary_co2_final_demand_of_electricity',
        'primary_co2_final_demand_of_heat',
        'primary_co2_final_demand_of_hydrogen',
        'primary_co2_final_demand_of_natural_gas_and_derivatives',
        'primary_co2_final_demand_of_oil_and_derivatives'
      ]
    },
    {
      key: 'by_sector_and_carrier',
      slug: 'by-sector-and-carrier',
      displayAs: 'table',
      series: [
        'primary_co2_of_coal_and_derivatives_in_agriculture',
        'primary_co2_of_coal_and_derivatives_in_buildings',
        'primary_co2_of_coal_and_derivatives_in_bunkers',
        'primary_co2_of_coal_and_derivatives_in_energy_and_other',
        'primary_co2_of_coal_and_derivatives_in_households',
        'primary_co2_of_coal_and_derivatives_in_industry',
        'primary_co2_of_coal_and_derivatives_in_transport',
        'primary_co2_of_electricity_in_agriculture',
        'primary_co2_of_electricity_in_buildings',
        'primary_co2_of_electricity_in_bunkers',
        'primary_co2_of_electricity_in_energy_and_other',
        'primary_co2_of_electricity_in_households',
        'primary_co2_of_electricity_in_industry',
        'primary_co2_of_electricity_in_transport',
        'primary_co2_of_heat_in_agriculture',
        'primary_co2_of_heat_in_buildings',
        'primary_co2_of_heat_in_bunkers',
        'primary_co2_of_heat_in_energy_and_other',
        'primary_co2_of_heat_in_households',
        'primary_co2_of_heat_in_industry',
        'primary_co2_of_heat_in_transport',
        'primary_co2_of_hydrogen_in_agriculture',
        'primary_co2_of_hydrogen_in_buildings',
        'primary_co2_of_hydrogen_in_bunkers',
        'primary_co2_of_hydrogen_in_energy_and_other',
        'primary_co2_of_hydrogen_in_households',
        'primary_co2_of_hydrogen_in_industry',
        'primary_co2_of_hydrogen_in_transport',
        'primary_co2_of_natural_gas_and_derivatives_in_agriculture',
        'primary_co2_of_natural_gas_and_derivatives_in_buildings',
        'primary_co2_of_natural_gas_and_derivatives_in_bunkers',
        'primary_co2_of_natural_gas_and_derivatives_in_energy_and_other',
        'primary_co2_of_natural_gas_and_derivatives_in_households',
        'primary_co2_of_natural_gas_and_derivatives_in_industry',
        'primary_co2_of_natural_gas_and_derivatives_in_transport',
        'primary_co2_of_oil_and_derivatives_in_agriculture',
        'primary_co2_of_oil_and_derivatives_in_buildings',
        'primary_co2_of_oil_and_derivatives_in_bunkers',
        'primary_co2_of_oil_and_derivatives_in_energy_and_other',
        'primary_co2_of_oil_and_derivatives_in_households',
        'primary_co2_of_oil_and_derivatives_in_industry',
        'primary_co2_of_oil_and_derivatives_in_transport'
      ]
    }
  ]
};
