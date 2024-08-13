// Function to create maps that store index values for categories, subcategories, and sections.
export const createIndexMaps = (inputList: Array<{ path: string[] }>) => {
    // Maps to hold indices for categories, subcategories, and sections.
    const categoryIndexMap: Record<string, string> = {};
    const subCategoryIndexMap: Record<string, Record<string, string>> = {};
    const sectionIndexMap: Record<string, Record<string, Record<string, string>>> = {};

    // Map to store the required outer sections (category and subcategory) for each section
    const requiredOuterSectionsMap: Record<string, string[]> = {};

    // Counters to generate unique indices for each category, subcategory, and section
    let categoryCounter = 0;
    let subCategoryCounter = 0;
    let sectionCounter = 0;

    // Iterate over the input list to populate the maps
    inputList.forEach(({ path }) => {
      const [category, subCategory, section] = path;

      // Assign a unique index to the category if it hasn't been indexed yet
      if (!categoryIndexMap[category]) {
        categoryIndexMap[category] = getIndexString(categoryCounter);
        categoryCounter++;
      }

      // Assign a unique index to the subcategory if it hasn't been indexed yet
      if (subCategory && !subCategoryIndexMap[category]?.[subCategory]) {
        if (!subCategoryIndexMap[category]) {
          subCategoryIndexMap[category] = {};
        }
        subCategoryIndexMap[category][subCategory] = getIndexString(subCategoryCounter);
        subCategoryCounter++;
      }

      // Assign a unique index to the section if it hasn't been indexed yet
      if (section && !sectionIndexMap[category]?.[subCategory]?.[section]) {
        if (!sectionIndexMap[category]) {
          sectionIndexMap[category] = {};
        }
        if (!sectionIndexMap[category][subCategory]) {
          sectionIndexMap[category][subCategory] = {};
        }
        sectionIndexMap[category][subCategory][section] = getIndexString(sectionCounter);
        sectionCounter++;
      }

      // Store the required outer sections (category and subcategory) for the section
      requiredOuterSectionsMap[section] = [category, subCategory];
    });

    // Return the generated maps
    return { categoryIndexMap, subCategoryIndexMap, sectionIndexMap, requiredOuterSectionsMap };
  };

  // Helper function to convert a counter into a two-character string.
  const getIndexString = (counter: number): string => {
    const alphabetLength = 26;
    const firstChar = String.fromCharCode(65 + Math.floor(counter / alphabetLength));
    const secondChar = String.fromCharCode(65 + (counter % alphabetLength));
    return firstChar + secondChar;
  };

  // Function to serialize the expanded table state into a compact string.
  export const serializeTableState = (
    expandedSections: string[],
    inputList: Array<{ path: string[] }>
  ): string => {
    const { sectionIndexMap } = createIndexMaps(inputList);

    // Map the expanded sections to their corresponding indices and join them with a hyphen
    const serializedSec = expandedSections.map(section => {
      const [category, subCategoryName, sectionName] = section.split(' → ');

      const categoryMap = sectionIndexMap[category];
      const subCategoryMap = categoryMap ? categoryMap[subCategoryName] : undefined;
      const sectionIndex = subCategoryMap ? subCategoryMap[sectionName] : undefined;

      return sectionIndex || ''; // Return the section index or an empty string if not found
    }).join('');  // Join the indices without any delimiter

    // Return the serialized string directly (no Base64 encoding needed)
    return serializedSec;
  };

  // Function to parse the serialized table state back into expanded categories, subcategories, and sections.
  export const parseTableState = (
    stateString: string,
    inputList: Array<{ path: string[] }>
  ): {
    expandedMainCategories: string[];
    expandedSubCategories: string[];
    expandedSections: string[];
  } => {
    const { subCategoryIndexMap, sectionIndexMap } = createIndexMaps(inputList);

    const reverseSubCategoryIndexMap: Record<string, Record<string, string>> = {};
    Object.entries(subCategoryIndexMap).forEach(([category, subCategoryMap]) => {
      reverseSubCategoryIndexMap[category] = Object.fromEntries(
        Object.entries(subCategoryMap).map(([key, value]) => [value, key])
      );
    });

    const reverseSectionIndexMap: Record<string, Record<string, Record<string, string>>> = {};
    Object.entries(sectionIndexMap).forEach(([category, subCategoryMap]) => {
      reverseSectionIndexMap[category] = {};
      Object.entries(subCategoryMap).forEach(([subCategory, sectionMap]) => {
        reverseSectionIndexMap[category][subCategory] = Object.fromEntries(
          Object.entries(sectionMap).map(([key, value]) => [value, key])
        );
      });
    });

    // Arrays to store the expanded categories, subcategories, and sections
    const expandedMainCategories: string[] = [];
    const expandedSubCategories: string[] = [];
    const expandedSections: string[] = [];

    // Split the serialized state string into chunks of two characters
    const sectionIndices = stateString.match(/.{1,2}/g) || [];

    // Iterate over each section index to find and expand the corresponding sections
    sectionIndices.forEach(sectionIndex => {
      // Search through the reverse maps to find the corresponding section
      for (const [category, subCategoryMap] of Object.entries(reverseSectionIndexMap)) {
        for (const [subCategory, sectionMap] of Object.entries(subCategoryMap)) {
          const section = sectionMap[sectionIndex];
          if (section) {
            // Add the category to the expanded categories list if not already added
            if (!expandedMainCategories.includes(category)) {
              expandedMainCategories.push(category);
            }
            // Construct the subcategory key and add it to the expanded subcategories list
            const subCategoryKey = `${category} → ${subCategory}`;
            if (!expandedSubCategories.includes(subCategoryKey)) {
              expandedSubCategories.push(subCategoryKey);
            }
            // Construct the section key and add it to the expanded sections list
            const sectionKey = `${category} → ${subCategory} → ${section}`;
            expandedSections.push(sectionKey);
          }
        }
      }
    });

    // Return the expanded categories, subcategories, and sections
    return {
      expandedMainCategories,
      expandedSubCategories,
      expandedSections,
    };
  };
