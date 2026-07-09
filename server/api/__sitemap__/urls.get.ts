import catalogExport from '../../data/sentimony-db-export.json'
import { buildSitemapUrls, type SitemapCatalogExport } from '../../utils/sitemapUrls'

export default defineSitemapEventHandler(() => {
  return buildSitemapUrls(catalogExport as unknown as SitemapCatalogExport)
})
