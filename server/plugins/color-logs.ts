// Плагін: фарбує console.warn (жовтий) і console.error (червоний)
import { YELLOW, RED, RESET } from '../utils/log-colors'
import util from 'node:util'

export default defineNitroPlugin(() => {
  const origWarn = console.warn.bind(console)
  const origErr  = console.error.bind(console)

  console.warn = (...args: any[]) => {
    origWarn(`${YELLOW}${util.format(...args)}${RESET}`)
  }

  console.error = (...args: any[]) => {
    origErr(`${RED}${util.format(...args)}${RESET}`)
  }
})
