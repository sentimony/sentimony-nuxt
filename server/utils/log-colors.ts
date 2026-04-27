// Усі ANSI-коди та хелпери в одному місці
export const RESET    = '\x1b[0m'
export const CYAN     = '\x1b[36m'      // голубий для USER
export const BLUE     = '\x1b[34m'
export const RED      = '\x1b[31m'
export const YELLOW   = '\x1b[33m'
export const DIM      = '\x1b[90m'      // темно-сірий
export const GREEN32  = '\x1b[32m'      // зелений (304)
export const GREEN256 = '\x1b[38;5;36m' // 2xx (teal)

// Хелпер
export const paint = (color: string, text: string) => (color ? `${color}${text}${RESET}` : text)

// Палітра статусів: колір коробки і посилання
export function colorsForStatus(status: number) {
  if (status === 304) return { statusC: GREEN32,  linkC: GREEN32  }
  if (status >= 200 && status < 300) return { statusC: GREEN256, linkC: GREEN256 }
  if (status >= 300 && status < 400) return { statusC: YELLOW,   linkC: YELLOW   }
  if (status >= 400)                 return { statusC: RED,      linkC: RED      }
  return { statusC: '', linkC: '' }
}
