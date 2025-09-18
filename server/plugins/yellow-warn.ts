// server/plugins/yellow-warn.ts
import { YELLOW, RESET } from '../utils/log-colors'
import util from 'node:util'

export default defineNitroPlugin(() => {
  const origWarn = console.warn.bind(console)

  console.warn = (...args: any[]) => {
    // форматування як у Node (підтримка %s, %o тощо)
    const msg = util.format(...args)
    origWarn(`${YELLOW}${msg}${RESET}`)
  }
})
