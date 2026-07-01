import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentPath = fileURLToPath(
  new URL('../../app/components/Fractal.vue', import.meta.url),
)
const cssPath = fileURLToPath(
  new URL('../../app/assets/css/tailwind.css', import.meta.url),
)

describe('Fractal animation', () => {
  it('uses a stronger black edge in the dark gradient', () => {
    const source = readFileSync(cssPath, 'utf8')

    expect(source).toContain('rgba(0,0,0,0.5) 100%')
  })

  it('morphs petals with compositor transforms instead of layout geometry', () => {
    const source = readFileSync(componentPath, 'utf8')

    expect(source).not.toContain('<style>')
    expect(source).not.toContain('transition-[width,height]')
    expect(source).not.toMatch(/!w-\d+/)
    expect(source).not.toMatch(/!h-\d+/)
    expect(source).toContain('-top-24 -left-24 size-48')
    expect(source).toContain('rotate-(--petal-rotation)')
    expect(source).toContain('[background:var(--petal-gradient)]')
    expect(source).not.toContain('transform: `rotate(')
    expect(source).not.toContain(':style="{ background:')
    expect(source).toContain('transform-[translate3d(4rem,8rem,0)]')
    expect(source).toContain('transform-[translate3d(8rem,4rem,0)]!')
    expect(source).toContain('transform-[scale3d(0.666666667,1.333333333,1)]')
    expect(source).toContain('transform-[scale3d(1.333333333,0.666666667,1)]!')
    expect(source).toContain('motion-reduce:animate-none!')
    expect(source).toContain('motion-reduce:transition-none!')
  })
})
