export default defineCachedEventHandler(async () => {
  return await fetchAllCatalogTrackRows()
}, catalogCacheOptions())
