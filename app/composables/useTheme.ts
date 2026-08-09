import { useStorage } from '@vueuse/core'

type Theme = 'light' | 'dark'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> }
}

function getTransitionOrigin(event?: MouseEvent) {
  // Keyboard activation dispatches a click with detail 0 and zeroed coordinates.
  if (event && event.detail > 0) return { x: event.clientX, y: event.clientY }

  const target = event?.currentTarget
  if (target instanceof Element) {
    const rect = target.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

export function useTheme() {
  const stored = useStorage<Theme>('theme', 'dark')
  const isDark = useState('theme-is-dark', () => true)

  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })

  function setTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    stored.value = theme
    isDark.value = theme === 'dark'
  }

  function toggle(event?: MouseEvent) {
    const next: Theme = isDark.value ? 'light' : 'dark'
    const doc = document as ViewTransitionDocument
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (typeof doc.startViewTransition !== 'function' || prefersReduced) {
      setTheme(next)
      return
    }

    const origin = getTransitionOrigin(event)

    const transition = doc.startViewTransition(() => setTheme(next))
    transition.ready
      .then(() => {
        const { x, y } = origin
        const w = window.innerWidth
        const h = window.innerHeight
        // Percentages resolve against the pseudo-element's own box, so the reveal stays
        // anchored to the click even when the ::view-transition tree is scaled (browser
        // zoom / high-DPI), where raw px land at `click * scale` instead.
        const cx = (x / w) * 100
        const cy = (y / h) * 100
        const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
        const r = (radius / (Math.hypot(w, h) / Math.SQRT2)) * 100
        document.documentElement.animate(
          { clipPath: [`circle(0% at ${cx}% ${cy}%)`, `circle(${r}% at ${cx}% ${cy}%)`] },
          { duration: 900, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }

  return { isDark, setTheme, toggle }
}
