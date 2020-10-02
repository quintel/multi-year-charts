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
    }
  ]
};
