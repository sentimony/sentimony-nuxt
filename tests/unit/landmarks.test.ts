import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')
const cssBlock = (source: string, opener: string) => {
  const start = source.indexOf(opener)
  expect(start, `${opener} block missing`).toBeGreaterThan(-1)
  const end = source.indexOf('\n}', start)
  return source.slice(start, end)
}

const appSourceFiles = () =>
  (readdirSync(projectFile('app'), { recursive: true, encoding: 'utf8' }) as string[])
    .filter(file => file.endsWith('.vue'))
    .map(file => `app/${file}`)

describe('document landmarks', () => {
  it('declares exactly one main per rendered document', () => {
    const owners = appSourceFiles().filter(file => readProjectFile(file).includes('<main'))

    // error.vue renders outside NuxtLayout, so it owns its own <main>.
    expect(owners.sort()).toEqual(['app/error.vue', 'app/layouts/default.vue'])
  })

  it('gives the layout main the skip-link target id', () => {
    const layout = readProjectFile('app/layouts/default.vue')

    expect(layout).toMatch(/<main\s+id="main"\s+tabindex="-1"/)
  })

  it('keeps the hero, the swipers and the page slot inside main', () => {
    const layout = readProjectFile('app/layouts/default.vue')
    const mainStart = layout.indexOf('<main')
    const mainEnd = layout.indexOf('</main>')

    for (const node of ['<Hero', '<LazySwiper', '<slot/>']) {
      const indexes = [...layout.matchAll(new RegExp(node, 'g'))].map(match => match.index)
      expect(indexes.length, `${node} is missing from the layout`).toBeGreaterThan(0)
      for (const index of indexes) {
        expect(index, `${node} renders outside <main>`).toBeGreaterThan(mainStart)
        expect(index, `${node} renders outside <main>`).toBeLessThan(mainEnd)
      }
    }
    expect(layout.indexOf('<Header'), 'the header is its own landmark').toBeLessThan(mainStart)
  })

  it('wraps the header and footer in their own landmarks', () => {
    expect(readProjectFile('app/components/Header.vue')).toContain('<header data-testid="site-header"')
    expect(readProjectFile('app/components/Footer.vue')).toContain('<footer data-testid="site-footer"')
  })

  it('names every navigation region', () => {
    expect(readProjectFile('app/components/Header.vue')).toContain('<nav aria-label="Main"')
    expect(readProjectFile('app/components/Footer.vue')).toContain('<nav aria-label="Footer"')
    expect(readProjectFile('app/components/OpenSidebar.vue')).toContain('<nav aria-label="Mobile"')
    expect(readProjectFile('app/pages/profile.vue')).toContain('aria-label="Profile collection"')
  })
})

describe('skip link', () => {
  it('is the first focusable node of the layout', () => {
    const layout = readProjectFile('app/layouts/default.vue')
    const templateStart = layout.indexOf('<template>')
    const skipIndex = layout.indexOf('href="#main"')
    const sidebarIndex = layout.indexOf('<OpenSidebar')

    expect(skipIndex).toBeGreaterThan(templateStart)
    expect(skipIndex, 'the burger button would otherwise take focus first').toBeLessThan(sidebarIndex)
  })

  it('positions itself only while focused', () => {
    const layout = readProjectFile('app/layouts/default.vue')

    expect(layout).toContain('sr-only focus:not-sr-only')
    expect(layout, 'not-sr-only resets position to static and beats a bare fixed').toContain('focus:fixed')
    expect(layout).toContain('focus:z-50')
  })

  it('offsets scrolling for both sticky bars', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    const htmlRule = cssBlock(css, '\nhtml {')

    expect(htmlRule).toContain('scroll-padding-top: 5rem')
    expect(htmlRule).toContain('scroll-padding-bottom: 5rem')
  })
})

describe('page title elements', () => {
  it('makes the homepage hero the h1', () => {
    const hero = readProjectFile('app/components/Hero.vue')

    expect(hero).toContain('<h1 v-html="heroTitle"/>')
  })

  it('gives the error page its own main and h1', () => {
    const errorPage = readProjectFile('app/error.vue')

    expect(errorPage).toContain('<main')
    expect(errorPage).toContain('<h1')
    expect(errorPage, 'client navigation does not clear the error state').not.toMatch(/<NuxtLink|:to="/)
    // Every exit must clear the error, not just navigate.
    expect(errorPage).toContain('const handleError = (redirect: string) => clearError({ redirect })')
    const clicks = errorPage.match(/@click="[^"]*"/g) ?? []
    expect(clicks.length).toBeGreaterThan(0)
    for (const click of clicks) expect(click).toMatch(/^@click="handleError\('[^']+'\)"$/)
  })

  it('drops the dead transition utility from the error page', () => {
    expect(readProjectFile('app/error.vue')).not.toContain('transition-background')
  })
})
