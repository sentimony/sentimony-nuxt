import { useStorage } from '@vueuse/core'

type Theme = 'light' | 'dark'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> }
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

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2

    const transition = doc.startViewTransition(() => setTheme(next))
    transition.ready
      .then(() => {
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }

  return { isDark, setTheme, toggle }
}
