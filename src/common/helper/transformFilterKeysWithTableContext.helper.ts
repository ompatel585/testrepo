/**
 * transform filter Keys with table-prefix if more than 1 table is involved in query-builder
 */
export function transformFilterKeysWithTableContext(
  queryParams: any,
  mappings: Record<string, string>,
) {
  const updatedFilters = { ...queryParams.filter };

  for (const [key, value] of Object.entries(updatedFilters)) {
    const updatedKey = mappings[key] || key;
    updatedFilters[updatedKey] = value;
    if (mappings[key]) {
      delete updatedFilters[key];
    }
  }
  return updatedFilters;
}
