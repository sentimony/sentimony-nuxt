import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('OpenImage trigger', () => {
  const source = () => readProjectFile('app/components/OpenImage.vue')

  it('opens the dialog from a real button', () => {
    expect(source()).toContain('<DialogTrigger as-child>')
    expect(source()).toContain('<button')
    expect(source()).toContain(':aria-label="`Open full-size image: ${alt || \'image\'}`"')
  })

  it('disables the trigger instead of guarding the click handler', () => {
    expect(source()).toContain(':disabled="!image_xl"')
    expect(source(), 'DialogRoot owns the open state now').not.toContain('const isOpen = ref(false)')
    expect(source()).not.toContain('@click="open"')
  })

  it('keeps only phrasing content inside the button', () => {
    const templateStart = source().indexOf('<DialogTrigger as-child>')
    const templateEnd = source().indexOf('</DialogTrigger>')
    const trigger = source().slice(templateStart, templateEnd)

    expect(trigger, 'div inside button is invalid content').not.toContain('<div')
  })

  it('still derives the preview from the thumbnail variant', () => {
    expect(source()).toContain('thumb(props.image_th)')
    expect(source()).toContain('v-if="previewImage"')
  })
})

describe('icon-only tabs', () => {
  it('names the trigger when the label is hidden', () => {
    const tabs = readProjectFile('app/components/Tabs.vue')

    expect(tabs).toContain(':aria-label="hideTitles ? plainTitle(tab.info.title) : undefined"')
  })
})

describe('swiper controls', () => {
  const source = () => readProjectFile('app/components/Swiper.vue')

  it('names the navigation buttons and types them', () => {
    expect(source()).toContain('aria-label="Previous"')
    expect(source()).toContain('aria-label="Next"')
    expect(source().match(/type="button"/g) ?? []).toHaveLength(2)
  })

  it('groups the carousel in a named region without breaking heading order', () => {
    expect(source()).toMatch(/<section\s+:aria-label="title \?\? category"/)
    expect(source(), 'a swiper heading would render before the page h1').not.toContain('<h2')
  })
})

describe('images inside labelled links are decorative', () => {
  const files = [
    'app/components/Item.vue',
    'app/components/RelativeItem.vue',
    'app/pages/news.vue',
    'app/components/Header.vue',
    'app/components/Footer.vue',
    'app/components/OpenSidebar.vue',
    'app/components/buttons/PrimaryButton.vue',
    'app/components/buttons/DefaultButton.vue',
  ]

  it.each(files)('%s does not build alt text from the visible label or the file URL', (path) => {
    const source = readProjectFile(path)
    expect(source).not.toMatch(/:alt="[^"]*\+ ' ?(Thumbnail|thumbnail|Icon|icon)'"/)
    expect(source).not.toContain('alt="Sentimony Records Logo SVG"\n              class="mr-3')
  })
})
