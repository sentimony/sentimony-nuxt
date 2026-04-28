import { logRequest } from '../utils/logger'

export default defineEventHandler((event) => {
  logRequest(event)
})
