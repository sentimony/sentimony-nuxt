import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const profilePage = () =>
  readFileSync(
    fileURLToPath(new URL('../../app/pages/profile/index.vue', import.meta.url)),
    'utf8',
  )

describe('profile avatar removal confirmation', () => {
  it('requires a second explicit action before deleting the avatar', () => {
    const page = profilePage()

    expect(page).toContain('const confirmingDelete = ref(false)')
    expect(page).toContain('@click="confirmAvatarDelete"')
    expect(page).toContain('@click="deleteAvatar"')
    expect(page).toContain('Remove?')
    expect(page).toContain('Cancel')
  })

  it('can cancel with the button or Escape and resets after success', () => {
    const page = profilePage()

    expect(page).toContain('function cancelAvatarDelete()')
    expect(page).toContain('@keydown.esc="cancelAvatarDelete"')
    expect(page.match(/confirmingDelete\.value = false/g)).toHaveLength(2)
    expect(page.lastIndexOf('confirmingDelete.value = false'))
      .toBeLessThan(page.indexOf("toast.success('Avatar removed')"))
  })

  it('restores focus to the remove button after cancellation', () => {
    const page = profilePage()

    expect(page).toContain('const removeAvatarButton = ref<ComponentPublicInstance | null>(null)')
    expect(page).toContain('ref="removeAvatarButton"')
    expect(page).toContain('removeAvatarButton.value?.$el.focus()')
  })
})
