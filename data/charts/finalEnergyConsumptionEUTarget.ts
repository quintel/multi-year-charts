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
      group: 'fec_use',
      children: [
        {
          key: 'fec_eu_target_energetic_per_sector',
          slug: 'per-sector',
          group: 'fec_breakdown',
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
          children: [
            {
              key: 'fec_eu_target_energetic_sector_households',
              slug: 'households',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_households_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_buildings',
              slug: 'buildings',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_buildings_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_national_transport',
              slug: 'national-transport',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_national_transport_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_bunkers_international_aviation',
              slug: 'international-aviation',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_bunkers_international_aviation_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_blast_furnace_transformation',
              slug: 'blast-furnace-transformation',
              group: 'fec_sector',
              series: [
                'final_consumption_blast_furnace_transformation_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_industry_ex_ict_and_refineries',
              slug: 'industry-ex-ict-and-refineries',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_industry_ex_ict_and_refineries_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_industry_ict',
              slug: 'industry-ict',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_industry_ict_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_agriculture',
              slug: 'agriculture',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_agriculture_energetic',
              ],
            },
            {
              key: 'fec_eu_target_energetic_sector_other',
              slug: 'other',
              group: 'fec_sector',
              series: [
                'myc_sector_final_consumption_from_other_energetic',
              ],
            },
          ],
        },
      ],
    },
  ],
};
