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

    // error.vue renders outside NuxtLayout and gains its own <main> in Task 3.
    expect(owners.sort()).toEqual(['app/layouts/default.vue'])
  })

  it('gives the layout main the skip-link target id', () => {
    const layout = readProjectFile('app/layouts/default.vue')

    expect(layout).toMatch(/<main\s+id="main"\s+tabindex="-1"/)
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
