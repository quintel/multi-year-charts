export const serializeTableState = (
  expandedSections: string[],
  expandedSubCategories: string[],
  expandedMainCategories: string[],
  filteredGroupedInputList: Record<string, Record<string, Array<{ path: string[]; input_elements: any[] }>>>,
  showAllInputs: boolean
): string => {

  // Filter the expanded main categories to only include those visible in the filteredGroupedInputList
  const visibleExpandedMainCategories = expandedMainCategories.filter((mainCategory) =>
    Object.keys(filteredGroupedInputList).includes(mainCategory)
  );

  // Filter the expanded subcategories to only include those visible in the filteredGroupedInputList
  const visibleExpandedSubCategories = expandedSubCategories.filter((subCategory) => {
    const [mainCategory, subCategoryName] = subCategory.split(' → ');
    return filteredGroupedInputList[mainCategory]?.[subCategoryName];
  });

  // Filter the expanded sections to only include those visible in the filteredGroupedInputList
  const visibleExpandedSections = expandedSections.filter((section) => {
    const [mainCategory, subCategoryName, sectionName] = section.split(' → ');
    return filteredGroupedInputList[mainCategory]?.[subCategoryName]?.some(item => item.path[2] === sectionName);
  });

  // Track fully expanded main categories and subcategories. These will be used to simplify the serialized state
  const fullyExpandedMainCategories: string[] = [];
  const fullyExpandedSubCategories: string[] = [];

  // Check for fully expanded main categories
  visibleExpandedMainCategories.forEach((mainCategory) => {
    const visibleSubCategories = Object.keys(filteredGroupedInputList[mainCategory] || {});

    // Get the visible expanded subcategories for the current main category
    const expandedSubCategoriesForMainCategory = visibleExpandedSubCategories.filter((subCategory) =>
      subCategory.startsWith(mainCategory)
    );

    // Check if all visible subcategories are expanded
    if (visibleSubCategories.length === expandedSubCategoriesForMainCategory.length) {
      // Check if all expanded subcategories are fully expanded themselves
      const allSubCategoriesFullyExpanded = expandedSubCategoriesForMainCategory.every((subCategory) => {
        const [mainCategory, subCategoryName] = subCategory.split(' → ');
        const visibleSections = filteredGroupedInputList[mainCategory]?.[subCategoryName]?.map(item => item.path[2]) || [];
        const expandedSectionsForSubCategory = visibleExpandedSections.filter((section) =>
          section.startsWith(subCategory)
        );
        return visibleSections.length === expandedSectionsForSubCategory.length;
      });

      if (allSubCategoriesFullyExpanded) {
        fullyExpandedMainCategories.push(mainCategory);
      }
    }
  });

  // Check for fully expanded subcategories
  visibleExpandedSubCategories.forEach((subCategory) => {
    const [mainCategory, subCategoryName] = subCategory.split(' → ');

    // Skip subcategories that fall under a fully expanded main category
    if (fullyExpandedMainCategories.includes(mainCategory)) {
      return; // Don't add subcategories under fully expanded main categories
    }

    const visibleSections = filteredGroupedInputList[mainCategory]?.[subCategoryName]?.map(item => item.path[2]) || [];

    // Get the visible expanded sections for the current subcategory
    const expandedSectionsForSubCategory = visibleExpandedSections.filter((section) =>
      section.startsWith(subCategory)
    );

    // Check if all visible sections are expanded
    if (visibleSections.length === expandedSectionsForSubCategory.length) {
      fullyExpandedSubCategories.push(subCategory);
    }
  });

  // Create a constant for sections not under fully expanded main categories or fully expanded subcategories
  const visibleExpandedSectionsWithoutFullyExpandedCategories = visibleExpandedSections.filter((section) => {
    const [mainCategory, subCategoryName] = section.split(' → ');

    // Exclude sections that belong to fully expanded main or subcategories
    const isUnderFullyExpandedMainCategory = fullyExpandedMainCategories.includes(mainCategory);
    const isUnderFullyExpandedSubCategory = fullyExpandedSubCategories.some(
      (subCategory) => subCategory === `${mainCategory} → ${subCategoryName}`
    );

    return !isUnderFullyExpandedMainCategory && !isUnderFullyExpandedSubCategory;
  });

  console.log('visible expanded sections without fully expanded categories     ', visibleExpandedSectionsWithoutFullyExpandedCategories);
  // Serialize the expanded state into a URL-like string

  const serializedState = [
    fullyExpandedMainCategories.join(','),
    fullyExpandedSubCategories.join(','),
    visibleExpandedSectionsWithoutFullyExpandedCategories.join(',')
  ].filter(Boolean).join(',');

  // Replace all instances of '→' with '/'
  const finalSerializedState = serializedState.replace(/ → /g, ' / ');

  // Append the showAllInputs flag to the serialized state
  return `${finalSerializedState}|showAll=${showAllInputs}`;
};

export const parseTableState = (
  serializedState: string,
  filteredGroupedInputList: Record<string, Record<string, Array<{ path: string[]; input_elements: any[] }>>>
): {
  expandedMainCategories: string[],
  expandedSubCategories: string[],
  expandedSections: string[],
  showAllInputs: boolean
} => {

  const expandedMainCategories: string[] = [];
  const expandedSubCategories: string[] = [];
  const expandedSections: string[] = [];

  // Split the serialized state into the expanded state and showAllInputs flag
  const [stateString, toggleFlag] = serializedState.split('|');
  const segments = stateString ? stateString.split(',') : [];

  segments.forEach(segment => {
    const parts = segment.split('/').map(decodeURIComponent).map(part => part.trim()); // Decode each part of the path and trim whitespace
    console.log('parts', parts);
    if (parts.length === 1) {
      // This represents a fully expanded main category
      const mainCategory = parts[0];
      if (filteredGroupedInputList[mainCategory]) {
        expandedMainCategories.push(mainCategory);

        // Recursively expand all subcategories and sections under this main category
        Object.keys(filteredGroupedInputList[mainCategory] || {}).forEach(subCategoryName => {
          expandedSubCategories.push(`${mainCategory} → ${subCategoryName}`);

          // Expand all sections within this subcategory
          const sections = filteredGroupedInputList[mainCategory][subCategoryName];
          sections.forEach(section => {
            expandedSections.push(`${mainCategory} → ${subCategoryName} → ${section.path[2]}`);
          });
        });
      }
    } else if (parts.length === 2) {
      // This represents a fully expanded subcategory
      const [mainCategory, subCategoryName] = parts;
      if (filteredGroupedInputList[mainCategory]?.[subCategoryName]) {
        expandedMainCategories.push(mainCategory);
        expandedSubCategories.push(`${mainCategory} → ${subCategoryName}`);

        // Recursively expand all sections under this subcategory
        const sections = filteredGroupedInputList[mainCategory][subCategoryName];
        sections.forEach(section => {
          expandedSections.push(`${mainCategory} → ${subCategoryName} → ${section.path[2]}`);
        });
      }
    } else if (parts.length === 3) {
      // This represents an expanded section with a full path
      const [mainCategory, subCategoryName, sectionName] = parts;
      if (filteredGroupedInputList[mainCategory]?.[subCategoryName]?.some(item => item.path[2] === sectionName)) {
        expandedMainCategories.push(mainCategory);
        expandedSubCategories.push(`${mainCategory} → ${subCategoryName}`);
        expandedSections.push(`${mainCategory} → ${subCategoryName} → ${sectionName}`);
      }
    }
  });

  // Remove duplicates across the expanded lists
  const uniqueExpandedMainCategories = Array.from(new Set(expandedMainCategories));
  const uniqueExpandedSubCategories = Array.from(new Set(expandedSubCategories));
  const uniqueExpandedSections = Array.from(new Set(expandedSections));

  // Parse the showAllInputs flag, defaulting to false if not present
  const showAllInputs = toggleFlag === "showAll=true" ? true : false;

  // Return the parsed state
  return {
    expandedMainCategories: uniqueExpandedMainCategories,
    expandedSubCategories: uniqueExpandedSubCategories,
    expandedSections: uniqueExpandedSections,
    showAllInputs: showAllInputs
  };
};
