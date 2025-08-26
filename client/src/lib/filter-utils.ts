// Helper functions for filter management
const STORAGE_KEYS = {
  currentFilter: 'draftwell_current_filter',
  currentTagFilter: 'draftwell_current_tag_filter',
  searchQuery: 'draftwell_search_query',
  sortOrder: 'draftwell_sort_order',
  filtersExpanded: 'draftwell_filters_expanded'
};

// Reset all filters to their default values
export const resetFiltersToDefault = (): void => {
  try {
    // Remove all filter-related items from localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch {
    // Silent fail if localStorage is not available
  }
};