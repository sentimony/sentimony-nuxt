# Page Override: Login (`/login`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Login page.
> Source: derived from `app/pages/login.vue` (101 lines today — combines signin + signup via internal mode toggle, uses `font-['Julius_Sans_One']` directly bypassing Tailwind config).
>
> **Recommended split:** the current internal mode toggle on `/login` should be split into separate routes — `/login` (signin only) and `/signup` (registration). See `pages/signup.md`. Both pages share design tokens but have distinct intents and SEO.

## Pattern

- **Page role:** Authenticate an existing user. **Single-purpose** — does NOT also handle signup.
- **Composition:** `Title block` → `Form (email + password + show-toggle + submit)` → `Footer links (forgot password / no account → /signup)`.
- **Why split from signup:** dedicated URL for sharing / analytics / SEO; less cognitive load on the form (one CTA, not a mode-toggle); allows independent OAuth / magic-link evolution per page.

## Layout (top → bottom)

```
min-h-[70vh] flex items-center justify-center px-4 py-16
│
└── div max-w-sm w-full
    │
    ├── TITLE BLOCK
    │   ┌────────────────────────────────────────┐
    │   │ Sign In                          [h1]  │
    │   │ (text-2xl text-center mb-8)            │
    │   │                                        │
    │   │ NOTE: replace `font-['Julius_Sans_One']│
    │   │ with `font-julius` (Tailwind config    │
    │   │ token). Or use plain text-2xl          │
    │   │ Montserrat — Julius is reserved for    │
    │   │ brand moments per MASTER §Typography,  │
    │   │ and an auth form heading is utility,   │
    │   │ not a brand moment.                    │
    │   │                                        │
    │   │ Recommendation: drop Julius here —     │
    │   │ use `text-2xl mb-8 text-center`        │
    │   │ (Montserrat default).                  │
    │   └────────────────────────────────────────┘
    │
    ├── FORM
    │   ┌────────────────────────────────────────┐
    │   │ <form @submit.prevent="signIn">        │
    │   │   bg-white/5 backdrop-blur-sm           │
    │   │   border border-white/20 rounded-lg p-6│
    │   │   flex flex-col gap-4                   │
    │   │                                        │
    │   │ Email field:                           │
    │   │   <label class="sr-only or visible      │
    │   │     above input — pick one consistently│
    │   │     and use `text-xs text-white/50      │
    │   │     uppercase tracking-widest`>Email   │
    │   │   <input type="email" autocomplete="email"│
    │   │     required class="bg-white/10 border  │
    │   │     border-white/20 rounded px-3 py-2"  │
    │   │   />                                   │
    │   │                                        │
    │   │ Password field:                        │
    │   │   <label>Password</label>              │
    │   │   <div class="relative">               │
    │   │     <input type="password|text"        │
    │   │       autocomplete="current-password"  │
    │   │       required class="...pr-10" />     │
    │   │     <button type="button"              │
    │   │       @click="showPassword = !show...  │
    │   │       class="absolute right-2..."      │
    │   │       aria-label="Show password">      │
    │   │       <Icon :name="showPassword ?      │
    │   │         'heroicons:eye-slash' :        │
    │   │         'heroicons:eye'" />            │
    │   │     </button>                          │
    │   │   </div>                               │
    │   │                                        │
    │   │ Forgot password link:                  │
    │   │   <NuxtLink to="/forgot-password"      │
    │   │     class="text-xs text-white/50       │
    │   │     hover:text-white text-right         │
    │   │     -mt-2">                            │
    │   │     Forgot password?                   │
    │   │   </NuxtLink>                          │
    │   │   (NEW — currently missing; see        │
    │   │    Out of scope for /forgot-password   │
    │   │    page status)                        │
    │   │                                        │
    │   │ Error / message:                       │
    │   │   <p v-if="error"                      │
    │   │     class="text-red-400 text-sm"       │
    │   │     role="alert">{{ error }}</p>       │
    │   │   <p v-if="message"                    │
    │   │     class="text-green-400 text-sm"     │
    │   │     role="status">{{ message }}</p>    │
    │   │                                        │
    │   │ Submit button:                         │
    │   │   <button type="submit"                │
    │   │     :disabled="loading"                │
    │   │     class="border border-white/30      │
    │   │     rounded px-4 py-2                  │
    │   │     hover:bg-white/20 disabled:        │
    │   │     opacity-40 transition-colors       │
    │   │     duration-300"                      │
    │   │     v-wave>                            │
    │   │     {{ loading ? 'Signing in…' :       │
    │   │        'Sign In' }}                    │
    │   │   </button>                            │
    │   └────────────────────────────────────────┘
    │
    ├── (OPTIONAL) OAUTH / MAGIC LINK ROW
    │   ┌────────────────────────────────────────┐
    │   │ <div class="text-center text-xs        │
    │   │   text-white/40 my-4">                 │
    │   │   or                                   │
    │   │ </div>                                 │
    │   │ <button>Sign in with Google</button>   │
    │   │ <button>Send magic link</button>       │
    │   │                                        │
    │   │ - Defer until Supabase OAuth providers │
    │   │   are wired. v1: omit entirely.        │
    │   └────────────────────────────────────────┘
    │
    └── FOOTER LINKS
        ┌────────────────────────────────────────┐
        │ <p class="text-center mt-4 text-sm     │
        │   text-white/40">                      │
        │   No account?                          │
        │   <NuxtLink to="/signup"               │
        │     class="text-white/70 hover:text-   │
        │     white underline ml-1">             │
        │     Sign up                            │
        │   </NuxtLink>                          │
        │ </p>                                   │
        └────────────────────────────────────────┘
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Page wrapper | `min-h-[70vh] flex items-center justify-center px-4 py-16` | full-screen-ish auth layout |
| Form container | `bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6 flex flex-col gap-4` | form surface |
| Form max-width | `max-w-sm w-full` | narrow column |
| Page heading | `text-2xl text-center mb-8` (Montserrat — drop Julius) | h1 |
| Field label | `text-xs text-white/50 tracking-widest uppercase` | label |
| Input base | `bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/50 transition-colors` | input |
| Input with eye-toggle | `pr-10` extension to base | password input |
| Eye-toggle button | `absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80` | show/hide password |
| Forgot password link | `text-xs text-white/50 hover:text-white text-right -mt-2` | inline-form link |
| Error message | `text-red-400 text-sm` + `role="alert"` | error |
| Success message | `text-green-400 text-sm` + `role="status"` | success |
| Submit button | `border border-white/30 rounded px-4 py-2 hover:bg-white/20 focus-visible:bg-white/20 disabled:opacity-40 transition-colors duration-300` | primary action |
| Footer link block | `text-center mt-4 text-sm text-white/40` | "No account?" line |
| Footer link | `text-white/70 hover:text-white underline ml-1` | inline /signup link |

**Note on existing styles:** `bg-white/10` on inputs is a **light-on-dark text input** that is allowed because it's still translucent — readable against the photo bg + form-skim layered backdrop. This does NOT trigger the Light Surfaces contract (bg-white/95 from MASTER §Light Surfaces) — that's reserved for full opacity inputs in light contexts (e.g. a future modal form with prose). Two separate cases.

## Components

**Reuse:**
- `<NuxtLink>` for footer link to `/signup`
- `<Icon>` Heroicons (`eye`, `eye-slash`)
- `<PageTitle>` NOT used — auth pages use centered `<h1>` directly (different vertical rhythm than catalog pages)

**Do not introduce:**
- ❌ A custom form library (vee-validate, etc.). Native HTML5 validation + Supabase error messaging is sufficient.
- ❌ Animated form transitions (mode toggle slides). Removed by splitting routes.
- ❌ A captcha at v1. Add when actual abuse appears.

## Data

**Composable extraction (recommended):** the current login.vue handles signin and signup in one file. After splitting, extract a shared composable:

```ts
// app/composables/useAuth.ts
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  return { user, signIn, signUp, signOut }
}
```

Each page (`login.vue`, `signup.vue`, `profile.vue`) imports just what it needs.

**Page-level state:**

```ts
// app/pages/login.vue (after split)
const { signIn, user } = useAuth()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

watchEffect(() => { if (user.value) navigateTo('/profile') })

async function submit() {
  loading.value = true; error.value = ''
  const { error: err } = await signIn(email.value, password.value)
  if (err) error.value = err.message
  else navigateTo('/profile')
  loading.value = false
}
```

## Interactions specific to this page

- **Form submit:** Enter in any field submits the form (native HTML5 form behaviour).
- **Password show-toggle:** clicking the eye icon toggles input type between `password` and `text`. ARIA on the toggle reads "Show password" / "Hide password" via dynamic `aria-label`.
- **Already authenticated:** `watchEffect` redirects to `/profile` immediately; the form never renders for logged-in users.
- **Error state:** error message appears below the form fields, above the submit button. Read by screen readers via `role="alert"`. Field that caused the error gets `aria-invalid="true"` (Supabase errors don't always identify which field; default to no field-level invalid until the error message indicates it).
- **Loading state:** submit button shows "Signing in…" and disables; `aria-busy="true"` on the form.
- **No autofocus on first input** — focus management on auth pages is contentious. Default browser behaviour (no auto-focus) avoids stealing focus from password managers.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Sign In</h1>` only.
- Each `<label>` paired with input via `for` attribute (or wraps the input). Don't rely on visual proximity alone.
- Input attributes: `autocomplete="email"` on email; `autocomplete="current-password"` on password (existing). These are critical for password manager UX.
- Required fields marked with `required` attribute; HTML5 validation messages are accessible by default.
- Eye-toggle button: `<button type="button">` (not submit), with `aria-label` that reflects current state.
- Error region: `role="alert"`; success region: `role="status"`.
- Submit disabled state: `disabled` attribute (announced by screen readers).
- Focus order: email → password → eye-toggle → forgot password link → submit → /signup link.
- All `:focus-visible` rings; all `v-wave` on submit and toggle (toggle is a small touch target, ensure ≥44pt).

## Anti-patterns specific to this page

- ❌ **Do not use `font-['Julius_Sans_One']` directly.** Use the Tailwind token `font-julius` if Julius is needed; better — use Montserrat default for utility-type pages like auth. The current direct font-family bypasses the project token system and risks divergence.
- ❌ **Do not combine signin + signup via mode toggle.** Two routes, two pages.
- ❌ **Do not show signup-only fields** (e.g. terms checkbox) on the login form.
- ❌ **Do not autofocus the email input.** Conflicts with password managers; mobile keyboards pop up unexpectedly.
- ❌ **Do not rely on placeholder text as the only label.** Visible labels (or sr-only labels) are accessibility minimum.
- ❌ **Do not hide the show-password toggle behind hover.** Always visible; touch users can't hover.
- ❌ **Do not redirect away from `/login` on submit-error.** Stay on the page; show error inline.
- ❌ **Do not show "Account created" message** on this page. That's the signup flow's success state.
- ❌ **Do not log error.message verbatim if it leaks internal info.** Supabase errors are generally safe (they don't reveal whether the email exists), but verify when adding new flows.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] `<h1>Sign In</h1>` (Montserrat, NOT Julius)
- [ ] Form has visible labels (or sr-only with consistent rule across both inputs)
- [ ] `autocomplete` attributes on email + password
- [ ] Show-password toggle has dynamic `aria-label`
- [ ] Forgot password link present (link target may 404 in v1; document gap)
- [ ] "No account? Sign up →" footer link points to `/signup`
- [ ] Error region uses `role="alert"`; success region uses `role="status"`
- [ ] Heading hierarchy: h1 only

### Behaviour

- [ ] Submit on Enter key
- [ ] Already-authenticated user redirected to `/profile` via `watchEffect`
- [ ] Password manager autofill works (verified with 1Password / Apple Keychain)
- [ ] Loading state disables submit + shows "Signing in…"
- [ ] Error displays inline; user remains on `/login`
- [ ] All `v-wave` and `:focus-visible` rings present

### Data

- [ ] Auth logic extracted into `useAuth` composable (shared with /signup, /profile)
- [ ] Mode-toggle removed from `/login` (replaced by /signup link)

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Form readable on photo background (form-skim provides contrast)
- [ ] Show-password toggle ≥44pt touch target

## Out of scope (deferred / open questions)

- **OAuth providers (Google / Apple / Discord)** — Supabase supports these; defer until label decides on identity providers. UI hooks reserved as documented.
- **Magic-link / passwordless** — Supabase supports `signInWithOtp`; defer to v2.
- **Forgot password flow (`/forgot-password`)** — referenced from login; needs separate page + email template work. v1: link target 404 acceptable as placeholder, or hide the link until shipped.
- **2FA / TOTP** — Supabase supports MFA; defer until user demand.
- **Remember me checkbox** — Supabase persists session by default; checkbox is mostly cosmetic.
- **Social proof on auth** ("Join 500 listeners") — feels needy for a label; skip.

## Cross-references

- `pages/signup.md`: paired page with shared design tokens.
- `pages/profile.md`: post-auth destination.
- Refactor backlog #2: `useDefaultSeo`. Useful when adding meta to auth pages.
- MASTER §Typography: Julius reserved for brand moments — auth h1 is utility, use Montserrat.
- MASTER §Components: form pattern documented in this override extends to /signup, /forgot-password, /reset-password (when added).
