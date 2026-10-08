// Final energy consumption as defined for the EU target: energetic use only, without
// industry refineries, international navigation and the energy sector, but including
// the net transformation in blast furnaces. No breakdown by carrier or sub-sector.

export default {
  key: 'final_energy_consumption_eu_target',
  slug: 'final-energy-consumption-eu-target',
  variants: [
    {
      key: 'fec_eu_target_energetic',
      slug: 'energetic',
      series: [
        'myc_sector_final_consumption_from_households_energetic',
        'myc_sector_final_consumption_from_buildings_energetic',
        'myc_sector_final_consumption_from_national_transport_energetic',
        'myc_sector_final_consumption_from_bunkers_international_aviation_energetic',
        'final_consumption_blast_furnace_transformation_energetic',
        'myc_sector_final_consumption_from_industry_ex_ict_and_refineries_energetic',
        'myc_sector_final_consumption_from_industry_ict_energetic',
        'myc_sector_final_consumption_from_agriculture_energetic',
        'myc_sector_final_consumption_from_other_energetic',
      ],
    },
  ],
};
