import { describe, expect, it, vi } from 'vitest'

const listUsers = vi.fn()

vi.mock('../../server/utils/supabaseAdmin', () => ({
  supabaseAdmin: () => ({
    auth: {
      admin: {
        listUsers,
      },
    },
  }),
}))

import { emailExists } from '../../server/utils/authEmail'

describe('emailExists', () => {
  it('returns true when the email is already registered', async () => {
    listUsers.mockResolvedValueOnce({
      data: {
        users: [{ email: 'Existing@Email.com' }],
      },
      error: null,
    })

    await expect(emailExists('existing@email.com')).resolves.toBe(true)
  })

  it('returns false when the email is not present', async () => {
    listUsers.mockResolvedValueOnce({
      data: {
        users: [],
      },
      error: null,
    })

    await expect(emailExists('new@example.com')).resolves.toBe(false)
  })
})
