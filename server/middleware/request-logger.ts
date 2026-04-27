import { logRequest } from '../utils/logger'

// Middleware для логування всіх HTTP запитів
export default defineEventHandler((event) => {
  logRequest(event)
})
