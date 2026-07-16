const FOREST_SRC =
  'https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg'

export default defineNuxtPlugin(() => {
  const img = useImage()
  const forestBg = img(FOREST_SRC, { format: 'webp', width: 1920, quality: 60 })

  const reveal = () => {
    const preload = new Image()
    preload.onload = () => {
      const root = document.documentElement
      root.style.setProperty('--forest-bg', `url("${forestBg}")`)
      requestAnimationFrame(() => root.classList.add('forest-ready'))
    }
    preload.src = forestBg
  }

  // Defer until the page is interactive so the background never competes
  // with first paint or the initial render-critical work.
  const schedule = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
  if (document.readyState === 'complete') schedule(reveal)
  else window.addEventListener('load', () => schedule(reveal), { once: true })
})
