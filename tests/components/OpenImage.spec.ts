import { describe, it, expect } from 'vitest'
import { mountWithStubs } from '../utils/mountWithStubs'
import OpenImage from '~/components/OpenImage.vue'

const xlImage = 'http://example.com/full.jpg'
const thImage = 'http://example.com/thumb.jpg'

describe('OpenImage.vue', () => {
  it('не відкриває модалку якщо image_xl відсутній', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, alt: 'no-xl' },
    })

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('клік по thumbnail відкриває модалку', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, image_xl: xlImage, alt: 'cover' },
    })

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
    expect(wrapper.find(`img[src="${xlImage}"]`).exists()).toBe(true)
  })

  it('Esc закриває відкриту модалку', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, image_xl: xlImage, alt: 'cover' },
      global: {
        stubs: {
          Transition: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('клік по бекдропу закриває; клік по контенту — ні', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, image_xl: xlImage, alt: 'cover' },
      global: {
        stubs: {
          Transition: { template: '<div><slot /></div>' },
        },
      },
    })

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    await wrapper.find(`img[src="${xlImage}"]`).trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    const backdrop = wrapper.find('.absolute.inset-0.bg-black\\/30')
    expect(backdrop.exists()).toBe(true)
    await backdrop.trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })
})
