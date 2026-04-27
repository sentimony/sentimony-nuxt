import { setupColoredConsole } from '../utils/logger'

// Nitro плагін для налаштування кольорової консолі
export default defineNitroPlugin(() => {
  setupColoredConsole()
})
