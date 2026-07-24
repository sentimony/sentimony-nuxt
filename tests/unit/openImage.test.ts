import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentPath = fileURLToPath(
  new URL('../../app/components/OpenImage.vue', import.meta.url),
)

describe('OpenImage', () => {
  it('derives the preview from the thumbnail variant', () => {
    const source = readFileSync(componentPath, 'utf8')

    expect(source).toContain('thumb(props.image_th)')
    expect(source).toContain('v-if="previewImage"')
    expect(source).toContain(':src="previewImage"')
  })
})
