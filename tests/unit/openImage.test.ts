import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentPath = fileURLToPath(
  new URL('../../app/components/OpenImage.vue', import.meta.url),
)

describe('OpenImage', () => {
  it('uses the xl image as the preview fallback when a thumbnail is missing', () => {
    const source = readFileSync(componentPath, 'utf8')

    expect(source).toContain('props.image_th || props.image_xl')
    expect(source).toContain('v-if="previewImage"')
    expect(source).toContain(':src="previewImage"')
  })
})
