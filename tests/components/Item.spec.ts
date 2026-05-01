import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mountWithStubs } from '../utils/mountWithStubs'
import Item from '~/components/Item.vue'

mockNuxtImport('useArtistLikes', () => () => ({
  isLiked: () => false,
  toggleLike: vi.fn(),
  likeCount: () => 0,
  fetchCount: vi.fn(),
}))

describe('Item.vue', () => {
  const baseItem = {
    slug: 'test-slug',
    title: 'Test Title',
    cover_th: 'http://example.com/cover.jpg',
    visible: true,
    date: '2024-01-01',
  }

  it('показує бейдж "Coming Soon" коли coming_soon=true', async () => {
    const wrapper = await mountWithStubs(Item, {
      props: { i: { ...baseItem, coming_soon: true }, category: 'release' },
    })

    const badge = wrapper.find('.bg-green-600')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Coming Soon')
  })

  it('показує бейдж "Out Now" коли new=true', async () => {
    const wrapper = await mountWithStubs(Item, {
      props: { i: { ...baseItem, new: true }, category: 'release' },
    })

    const badge = wrapper.find('.bg-red-600')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Out Now')
  })

  it('не показує бейдж за замовчуванням', async () => {
    const wrapper = await mountWithStubs(Item, {
      props: { i: baseItem, category: 'release' },
    })

    expect(wrapper.find('.bg-green-600').exists()).toBe(false)
    expect(wrapper.find('.bg-red-600').exists()).toBe(false)
  })

  it('like-кнопка з\'являється лише для category="artist"', async () => {
    const releaseWrapper = await mountWithStubs(Item, {
      props: { i: baseItem, category: 'release' },
    })
    expect(releaseWrapper.find('button[aria-pressed]').exists()).toBe(false)

    const artistWrapper = await mountWithStubs(Item, {
      props: { i: baseItem, category: 'artist' },
    })
    const likeBtn = artistWrapper.find('button[aria-pressed]')
    expect(likeBtn.exists()).toBe(true)
    expect(likeBtn.attributes('aria-label')).toContain('Test Title')
  })
})
