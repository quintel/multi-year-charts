export default {
  key: 'final_demand',
  slug: 'final-demand',
  variants: [
    {
      key: 'by_sector',
      slug: 'by-sector',
      series: [
        'final_demand_in_agriculture',
        'final_demand_in_buildings',
        'final_demand_in_households',
        'final_demand_in_industry',
        'final_demand_in_other_and_energy_sector',
        'final_demand_in_transport'
      ]
    },
    {
      key: 'by_carrier',
      slug: 'by-carrier',
      series: [
        'final_demand_of_coal_and_derivatives',
        'final_demand_of_fossil_electricity',
        'final_demand_of_fossil_heat',
        'final_demand_of_green_gas',
        'final_demand_of_heat',
        'final_demand_of_hydrogen',
        'final_demand_of_liquid_biofuels',
        'final_demand_of_natural_gas_and_derivatives',
        'final_demand_of_oil_and_derivatives',
        'final_demand_of_renewable_electricity',
        'final_demand_of_renewable_heat',
        'final_demand_of_solar_thermal',
        'final_demand_of_solid_biofuels'
      ]
    }
  ]
};
