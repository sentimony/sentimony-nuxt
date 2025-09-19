import util from 'node:util'
import { YELLOW, RED, RESET } from '../utils/log-colors'

const PATCH_MARK = Symbol.for('sentimony.colorLogsPatched')

export default defineNitroPlugin(() => {
  if ((globalThis as any)[PATCH_MARK]) return
  ;(globalThis as any)[PATCH_MARK] = true

  const origWarn = console.warn.bind(console)
  const origErr = console.error.bind(console)

  console.warn = (...args: any[]) => {
    origWarn(`${YELLOW}${util.format(...args)}${RESET}`)
  }

  console.error = (...args: any[]) => {
    origErr(`${RED}${util.format(...args)}${RESET}`)
  }
})
