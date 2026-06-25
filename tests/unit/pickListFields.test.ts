import { describe, expect, it } from 'vitest'
import { pickListFields } from '../../server/utils/pickListFields'

describe('pickListFields', () => {
  const source = {
    public: { slug: 'public', title: 'Public', visible: true, secret: 'drop' },
    hidden: { slug: 'hidden', title: 'Hidden', visible: false, secret: 'drop' },
  }

  it('keeps only requested fields', () => {
    expect(pickListFields(source, ['slug', 'title'])).toEqual({
      public: { slug: 'public', title: 'Public' },
      hidden: { slug: 'hidden', title: 'Hidden' },
    })
  })

  it('omits hidden entities when visibleOnly is enabled', () => {
    expect(pickListFields(source, ['slug', 'title', 'visible'], { visibleOnly: true })).toEqual({
      public: { slug: 'public', title: 'Public', visible: true },
    })
  })
})
