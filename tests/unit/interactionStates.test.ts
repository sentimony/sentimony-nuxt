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

const tagClasses = (source: string, marker: string) => {
  const markerIndex = source.indexOf(marker)
  expect(markerIndex, `${marker} missing`).toBeGreaterThan(-1)
  const tagStart = source.lastIndexOf('<', markerIndex)
  const tagEnd = source.indexOf('>', markerIndex)
  const tag = source.slice(tagStart, tagEnd)
  return tag.match(/(?:^|\s)class="([^"]*)"/)?.[1] ?? ''
}

const appSourceFiles = () =>
  (readdirSync(projectFile('app'), { recursive: true, encoding: 'utf8' }) as string[])
    .filter(file => file.endsWith('.vue') || file.endsWith('.ts'))
    .map(file => `app/${file}`)

describe('interaction state tokens', () => {
  it('defines interaction tokens in both themes', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    const tokens = ['--card', '--muted-foreground', '--ring', '--input', '--destructive', '--success']

    for (const opener of ['\n:root {', '\n.dark {']) {
      const block = cssBlock(css, opener)
      for (const token of tokens) {
        expect(block, `${token} missing in ${opener.trim()}`).toContain(`${token}:`)
      }
    }

    expect(cssBlock(css, '\n@theme inline {')).toContain('--color-success: var(--success)')
  })

  it('keeps the card fill lighter than the page in light and darker in dark', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    expect(cssBlock(css, '\n:root {')).toContain('--card: oklch(1 0 0 / 55%)')
    expect(cssBlock(css, '\n.dark {')).toContain('--card: oklch(0 0 0 / 25%)')
  })

  it('keeps secondary text at the same alpha in both themes', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    expect(cssBlock(css, '\n:root {')).toContain('--muted-foreground: oklch(0 0 0 / 62%)')
    expect(cssBlock(css, '\n.dark {')).toContain('--muted-foreground: oklch(1 0 0 / 62%)')
  })
})

describe('button primitive', () => {
  const buttonSource = () => readProjectFile('app/components/ui/button/index.ts')
  const cvaBase = (source: string) => source.match(/cva\(\s*'([^']*)'/)?.[1] ?? ''

  it('renders a visible focus indicator from the cva base', () => {
    const base = cvaBase(buttonSource())

    expect(base).toContain('focus-visible:outline-2')
    expect(base).toContain('focus-visible:outline-offset-2')
    expect(base).toContain('focus-visible:outline-ring')
    expect(base, 'unconditional outline-none kills the focus indicator').not.toContain('outline-none')
  })

  it('has a submit variant that works in both themes without dark duplicates', () => {
    const submit = buttonSource().match(/submit:\s*\n\s*'([^']*)'/)?.[1] ?? ''

    expect(submit).toContain('bg-foreground/12')
    expect(submit).toContain('border-foreground/30')
    expect(submit, 'submit must not need a dark: duplicate').not.toContain('dark:')
  })
})

describe('input primitive', () => {
  it('uses a visible outline and one fill for both themes', () => {
    const input = readProjectFile('app/components/ui/input/Input.vue')

    expect(input).toContain('focus-visible:outline-solid')
    expect(input).toContain('focus-visible:outline-2')
    expect(input).toContain('focus-visible:outline-offset-2')
    expect(input).toContain('focus-visible:outline-ring')
    expect(input, 'shadow-xs leaves the Tailwind ring slot visually inactive').not.toContain('focus-visible:ring-')
    expect(input, 'unconditional outline-none kills the focus indicator').not.toContain('outline-none')
    expect(input).toContain('bg-foreground/8')
    expect(input).not.toContain('bg-transparent')
    expect(input, 'the shared fill removes the dark-only background').not.toContain('dark:bg-input/30')
  })
})

describe('non-primitive focus', () => {
  it('replaces browser-default focus colours with the semantic ring token', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    const focusRule = cssBlock(css, '\n:is(a, button, [role="button"], input[type="range"], summary):focus-visible {')
    expect(focusRule).toContain('outline: 2px solid var(--ring)')
    expect(focusRule).toContain('outline-offset: 2px')

    // Unlayered declarations outrank anything in @layer utilities regardless of
    // specificity; wrapping this rule in a layer would silently disable it.
    // tailwind.css has no @layer today, so any earlier @layer means it moved.
    const ruleIndex = css.indexOf(':is(a, button, [role="button"], input[type="range"], summary):focus-visible')
    const enclosingLayer = css.lastIndexOf('@layer', ruleIndex)
    expect(enclosingLayer, 'the rule must stay unlayered').toBe(-1)

    const passwordToggleFocusRule = cssBlock(css, '\nbutton.password-toggle:focus-visible {')
    expect(passwordToggleFocusRule).toContain('outline-style: solid')
    expect(passwordToggleFocusRule).toContain('outline-width: 2px')
    expect(passwordToggleFocusRule).toContain('outline-color: var(--ring)')
    expect(passwordToggleFocusRule).toContain('outline-offset: 2px')
  })

  it('lets no component suppress the shared focus indicator', () => {
    for (const file of ['app/components/ThemeToggle.vue', 'app/components/Header.vue']) {
      const source = readProjectFile(file)
      expect(source, `${file} keeps a dead outline-none`).not.toContain('outline-none')
      expect(source, `${file} draws a ring on top of the outline`).not.toContain('focus-visible:ring-')
    }
  })

  it('keeps focus immediate and light on the intentional dark footer', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    const footer = readProjectFile('app/components/Footer.vue')
    const rootClasses = tagClasses(footer, 'data-testid="site-footer"')
    const navLinkClasses = tagClasses(footer, 'v-for="i in getNav()"')
    const socialLinkClasses = tagClasses(footer, ':href="i.url"')
    const darkRing = cssBlock(css, '\n.dark {').match(/--ring:\s*([^;]+);/)?.[1] ?? ''
    const footerRing = rootClasses
      .match(/\[--ring:([^\]]+)\]/)?.[1]
      ?.replaceAll('_', ' ') ?? ''

    expect(darkRing).not.toBe('')
    expect(footerRing).toBe(darkRing)
    expect(navLinkClasses).toContain('transition-[color,background-color]')
    expect(navLinkClasses).not.toContain('transition-colors')
    expect(socialLinkClasses).toContain('transition-[opacity,background-color]')
    expect(socialLinkClasses).not.toContain('transition-colors')
  })
})

describe('success feedback', () => {
  it('has a success alert variant built on the token', () => {
    const alert = readProjectFile('app/components/ui/alert/index.ts')

    expect(alert).toContain("success: 'bg-card text-success'")
  })

  it('has no hardcoded green left in app sources', () => {
    const offenders = appSourceFiles().filter(file => readProjectFile(file).includes('text-green-400'))

    expect(offenders, 'green-400 is baked for dark theme and gives 1.59 in light').toEqual([])
  })
})

describe('auth surface', () => {
  const AUTH_FILES = [
    'app/components/AuthCard.vue',
    'app/components/AuthForm.vue',
    'app/components/PasswordInput.vue',
    'app/pages/reset-password.vue',
    'app/pages/confirm.vue',
  ]

  it('uses only the two semantic text tiers', () => {
    for (const file of AUTH_FILES) {
      expect(readProjectFile(file), `${file} keeps a sub-AA text tier`).not.toMatch(/text-foreground\/(30|35|40|45|50)\b/)
    }
  })

  it('has no paired black/white duplicates', () => {
    for (const file of AUTH_FILES) {
      expect(readProjectFile(file), `${file} keeps a paired light/dark duplicate`)
        .not.toMatch(/-(?:black|white)\/\d+\s+dark:[a-z:-]*-(?:white|black)\/\d+/)
    }
  })

  it('shares one card shell between the auth form and reset-password', () => {
    const authCard = readProjectFile('app/components/AuthCard.vue')

    expect(authCard).toContain('border-foreground/20')
    expect(authCard).toContain('backdrop-blur-md')
    expect(readProjectFile('app/components/AuthForm.vue')).toContain('<AuthCard')
    expect(readProjectFile('app/pages/reset-password.vue')).toContain('<AuthCard')
  })

  it('uses the submit variant for form submits', () => {
    expect(readProjectFile('app/components/AuthForm.vue')).toContain('variant="submit"')
    expect(readProjectFile('app/pages/reset-password.vue')).toContain('variant="submit"')
  })
})

describe('profile surface', () => {
  const PROFILE_FILES = [
    'app/components/ProfileCollectionPage.vue',
    'app/components/CollectionStatus.vue',
    'app/pages/profile.vue',
    'app/pages/profile/index.vue',
    'app/pages/profile/tracks.vue',
  ]

  it('uses only the two semantic text tiers', () => {
    for (const file of PROFILE_FILES) {
      expect(readProjectFile(file), `${file} keeps an alpha text tier`)
        .not.toMatch(/text-foreground\/\d+/)
    }
  })

  it('has no paired black/white duplicates', () => {
    for (const file of PROFILE_FILES) {
      expect(readProjectFile(file), `${file} keeps a paired light/dark duplicate`)
        .not.toMatch(/-(?:black|white)\/\d+\s+dark:[a-z:-]*-(?:white|black)\/\d+/)
    }
  })

  it('leaves focus indicators to the global rule and the button base', () => {
    for (const file of PROFILE_FILES) {
      const source = readProjectFile(file)
      expect(source, `${file} kills the focus outline`).not.toContain('outline-none')
      expect(source, `${file} halves the ring token`).not.toContain('focus-visible:ring-')
    }
  })

  it('keeps technical labels at a legible size', () => {
    for (const file of PROFILE_FILES) {
      expect(readProjectFile(file), `${file} uses a 9px tier`).not.toContain('text-[9px]')
    }
  })

  it('has no hardcoded accent or status colours', () => {
    for (const file of PROFILE_FILES) {
      const source = readProjectFile(file)
      expect(source).not.toMatch(/(?:text|bg|border|ring)-red-\d+/)
      expect(source).not.toMatch(/(?:text|bg|border|ring)-blue-\d+/)
    }
  })

  it('associates the editable name field with its visible label', () => {
    const profile = readProjectFile('app/pages/profile/index.vue')

    expect(profile).toContain('<label for="profile-name"')
    expect(profile).toContain('id="profile-name"')
  })
})

describe('catalog surface', () => {
  const CATALOG_FILES = [
    'app/pages/release/[id].vue',
    'app/pages/track/[id].vue',
    'app/pages/artist/[id].vue',
    'app/pages/event/[id].vue',
    'app/pages/video/[id].vue',
    'app/pages/playlist/[id].vue',
    'app/pages/tracks.vue',
    'app/pages/news.vue',
    'app/components/EntityLinks.vue',
    'app/components/Swiper.vue',
    'app/components/ui/button/index.ts',
  ]

  it('uses only the two semantic text tiers', () => {
    for (const file of CATALOG_FILES) {
      expect(readProjectFile(file), `${file} keeps a sub-AA text tier`)
        .not.toMatch(/text-(?:foreground|white|black)\/(?:25|30|35|40|45|50)\b/)
    }
  })
})

describe('auth form accessibility', () => {
  it('links field errors to their inputs and announces them', () => {
    const authForm = readProjectFile('app/components/AuthForm.vue')

    expect(authForm).toContain('id="email-error"')
    expect(authForm).toContain('id="password-error"')
    expect(authForm).toContain("aria-describedby=\"errors.email ? 'email-error' : undefined\"")
    expect(authForm).toContain(":described-by=\"errors.password ? 'password-error' : undefined\"")
    expect(authForm.match(/role="alert"/g) ?? [], 'both field errors announce').toHaveLength(2)
  })

  it('labels the password visibility toggle', () => {
    const passwordInput = readProjectFile('app/components/PasswordInput.vue')

    expect(passwordInput).toContain(":aria-label=\"show ? 'Hide password' : 'Show password'\"")
    expect(passwordInput).toContain(':aria-pressed="show"')
    expect(passwordInput).toContain(':aria-describedby="describedBy"')
    const passwordToggleClasses = tagClasses(passwordInput, 'password-toggle')
    expect(passwordToggleClasses).toContain('transition-[color]')
    expect(passwordToggleClasses).not.toContain('transition-colors')
  })
})

describe('color-scheme follows the active theme', () => {
  it('declares both schemes in the document head', () => {
    expect(readProjectFile('nuxt.config.ts')).toContain("{ name: 'color-scheme', content: 'dark light' }")
  })

  it('sets color-scheme on the light root and the dark class', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    expect(css).toMatch(/:root \{\s*color-scheme: light;/)
    expect(css).toMatch(/\.dark \{\s*color-scheme: dark;/)
  })
})

describe('moss palette and forest tint live in tokens', () => {
  const css = () => readProjectFile('app/assets/css/tailwind.css')

  it('declares the moss colours once, inside @theme', () => {
    const theme = css().match(/@theme \{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(theme).toContain('--color-moss: #b5ccb5;')
    expect(theme).toContain('--color-moss-dark: #2a4030;')
    expect(css().match(/#b5ccb5/gi)).toHaveLength(1)
    expect(css().match(/#2a4030/gi)).toHaveLength(1)
  })

  it('keeps the literal colours out of components', () => {
    for (const file of ['app/components/SvgTriangle.vue', 'app/components/Testimonials.vue']) {
      expect(readProjectFile(file)).not.toMatch(/#b5ccb5|#2a4030/i)
    }
  })

  it('shares the forest tint between the global overlay and the homepage layer', () => {
    expect(css()).toMatch(/--forest-tint:/)
    expect(css()).toContain('background: var(--forest-tint);')
    const atmosphere = readProjectFile('app/components/HomepageAtmosphere.vue')
    expect(atmosphere).toContain('background: var(--forest-tint);')
    expect(atmosphere).not.toContain('linear-gradient(')
  })
})

describe('text keeps two tiers without stacked opacity', () => {
  const textLines = (path: string) => readProjectFile(path).split('\n').filter(line => line.includes('{{') || line.includes('Psychedelic Music Label'))

  it.each([
    'app/components/buttons/LikeButton.vue',
    'app/components/player/PagePlayer.vue',
    'app/components/Header.vue',
  ])('%s never dims text with an opacity utility', (path) => {
    for (const line of textLines(path)) {
      expect(line, line.trim()).not.toMatch(/\bopacity-(40|50|60)\b|opacity-\[0\.4\]/)
    }
  })

  it('footer text sits at 70% white, not 50%', () => {
    const footer = readProjectFile('app/components/Footer.vue')
    expect(footer).not.toContain('text-white/50')
    expect(footer).toContain('text-white/70')
  })

  it('artist index hover uses the foreground token', () => {
    const page = readProjectFile('app/pages/artists/all.vue')
    expect(page).not.toContain('hover:text-white/80')
    expect(page).toContain('hover:text-foreground/80')
  })
})
