export default {
  key: 'final_demand',
  slug: 'final-demand',
  variants: [
    {
      key: 'by_sector',
      slug: 'by-sector',
      series: [
        'myc_final_demand_in_agriculture',
        'myc_final_demand_in_buildings',
        'myc_final_demand_in_households',
        'myc_final_demand_in_industry',
        'myc_final_demand_in_other_and_energy_sector',
        'myc_final_demand_in_transport'
      ]
    },
    {
      key: 'by_carrier',
      slug: 'by-carrier',
      series: [
        'myc_final_demand_of_coal_and_derivatives',
        'myc_final_demand_of_fossil_electricity',
        'myc_final_demand_of_fossil_heat',
        'myc_final_demand_of_green_gas',
        'myc_final_demand_of_hydrogen',
        'myc_final_demand_of_liquid_biofuels',
        'myc_final_demand_of_natural_gas_and_derivatives',
        'myc_final_demand_of_oil_and_derivatives',
        'myc_final_demand_of_renewable_electricity',
        'myc_final_demand_of_renewable_heat',
        'myc_final_demand_of_solar_thermal',
        'myc_final_demand_of_solid_biofuels'
      ]
    },
    {
      key: 'by_sector_and_carrier',
      slug: 'by-sector-and-carrier',
      displayAs: 'table',
      series: [
        'myc_final_demand_of_coal_and_derivatives_in_agriculture',
        'myc_final_demand_of_coal_and_derivatives_in_buildings',
        'myc_final_demand_of_coal_and_derivatives_in_bunkers',
        'myc_final_demand_of_coal_and_derivatives_in_energy_and_other',
        'myc_final_demand_of_coal_and_derivatives_in_households',
        'myc_final_demand_of_coal_and_derivatives_in_industry',
        'myc_final_demand_of_coal_and_derivatives_in_transport',
        'myc_final_demand_of_fossil_electricity_in_agriculture',
        'myc_final_demand_of_fossil_electricity_in_buildings',
        'myc_final_demand_of_fossil_electricity_in_bunkers',
        'myc_final_demand_of_fossil_electricity_in_energy_and_other',
        'myc_final_demand_of_fossil_electricity_in_households',
        'myc_final_demand_of_fossil_electricity_in_industry',
        'myc_final_demand_of_fossil_electricity_in_transport',
        'myc_final_demand_of_fossil_heat_in_agriculture',
        'myc_final_demand_of_fossil_heat_in_buildings',
        'myc_final_demand_of_fossil_heat_in_bunkers',
        'myc_final_demand_of_fossil_heat_in_energy_and_other',
        'myc_final_demand_of_fossil_heat_in_households',
        'myc_final_demand_of_fossil_heat_in_industry',
        'myc_final_demand_of_fossil_heat_in_transport',
        'myc_final_demand_of_green_gas_in_agriculture',
        'myc_final_demand_of_green_gas_in_buildings',
        'myc_final_demand_of_green_gas_in_bunkers',
        'myc_final_demand_of_green_gas_in_energy_and_other',
        'myc_final_demand_of_green_gas_in_households',
        'myc_final_demand_of_green_gas_in_industry',
        'myc_final_demand_of_green_gas_in_transport',
        'myc_final_demand_of_hydrogen_in_agriculture',
        'myc_final_demand_of_hydrogen_in_buildings',
        'myc_final_demand_of_hydrogen_in_bunkers',
        'myc_final_demand_of_hydrogen_in_energy_and_other',
        'myc_final_demand_of_hydrogen_in_households',
        'myc_final_demand_of_hydrogen_in_industry',
        'myc_final_demand_of_hydrogen_in_transport',
        'myc_final_demand_of_liquid_biofuels_in_agriculture',
        'myc_final_demand_of_liquid_biofuels_in_buildings',
        'myc_final_demand_of_liquid_biofuels_in_bunkers',
        'myc_final_demand_of_liquid_biofuels_in_energy_and_other',
        'myc_final_demand_of_liquid_biofuels_in_households',
        'myc_final_demand_of_liquid_biofuels_in_industry',
        'myc_final_demand_of_liquid_biofuels_in_transport',
        'myc_final_demand_of_natural_gas_and_derivatives_in_agriculture',
        'myc_final_demand_of_natural_gas_and_derivatives_in_buildings',
        'myc_final_demand_of_natural_gas_and_derivatives_in_bunkers',
        'myc_final_demand_of_natural_gas_and_derivatives_in_energy_and_other',
        'myc_final_demand_of_natural_gas_and_derivatives_in_households',
        'myc_final_demand_of_natural_gas_and_derivatives_in_industry',
        'myc_final_demand_of_natural_gas_and_derivatives_in_transport',
        'myc_final_demand_of_oil_and_derivatives_in_agriculture',
        'myc_final_demand_of_oil_and_derivatives_in_buildings',
        'myc_final_demand_of_oil_and_derivatives_in_bunkers',
        'myc_final_demand_of_oil_and_derivatives_in_energy_and_other',
        'myc_final_demand_of_oil_and_derivatives_in_households',
        'myc_final_demand_of_oil_and_derivatives_in_industry',
        'myc_final_demand_of_oil_and_derivatives_in_transport',
        'myc_final_demand_of_renewable_electricity_in_agriculture',
        'myc_final_demand_of_renewable_electricity_in_buildings',
        'myc_final_demand_of_renewable_electricity_in_bunkers',
        'myc_final_demand_of_renewable_electricity_in_energy_and_other',
        'myc_final_demand_of_renewable_electricity_in_households',
        'myc_final_demand_of_renewable_electricity_in_industry',
        'myc_final_demand_of_renewable_electricity_in_transport',
        'myc_final_demand_of_renewable_heat_in_agriculture',
        'myc_final_demand_of_renewable_heat_in_buildings',
        'myc_final_demand_of_renewable_heat_in_bunkers',
        'myc_final_demand_of_renewable_heat_in_energy_and_other',
        'myc_final_demand_of_renewable_heat_in_households',
        'myc_final_demand_of_renewable_heat_in_industry',
        'myc_final_demand_of_renewable_heat_in_transport',
        'myc_final_demand_of_solar_thermal_in_agriculture',
        'myc_final_demand_of_solar_thermal_in_buildings',
        'myc_final_demand_of_solar_thermal_in_bunkers',
        'myc_final_demand_of_solar_thermal_in_energy_and_other',
        'myc_final_demand_of_solar_thermal_in_households',
        'myc_final_demand_of_solar_thermal_in_industry',
        'myc_final_demand_of_solar_thermal_in_transport',
        'myc_final_demand_of_solid_biofuels_in_agriculture',
        'myc_final_demand_of_solid_biofuels_in_buildings',
        'myc_final_demand_of_solid_biofuels_in_bunkers',
        'myc_final_demand_of_solid_biofuels_in_energy_and_other',
        'myc_final_demand_of_solid_biofuels_in_households',
        'myc_final_demand_of_solid_biofuels_in_industry',
        'myc_final_demand_of_solid_biofuels_in_transport'
      ]
    }
  ]
};
