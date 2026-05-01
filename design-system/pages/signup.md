# Page Override: Signup (`/signup`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Signup page.
> **Status: planned.** Currently the signup flow lives inside `app/pages/login.vue` as a mode toggle. Splitting to a dedicated `/signup` route is the recommended path; this override is the design contract for that future page.
>
> See `pages/login.md` for the paired signin page; both share design tokens.

## Pattern

- **Page role:** Create a new account. Single-purpose — does NOT also handle signin.
- **Composition:** `Title block` → `Form (email + password + (optional) confirm + terms checkbox + submit)` → `Confirmation hint` → `Footer link (already have account → /login)`.
- **Why split from login:** dedicated URL for sharing / SEO / marketing campaigns; one CTA per page; allows divergent evolution (signup gets terms, captcha, email verification flow that signin doesn't need).

## Layout (top → bottom)

```
min-h-[70vh] flex items-center justify-center px-4 py-16
│
└── div max-w-sm w-full
    │
    ├── TITLE BLOCK
    │   ┌────────────────────────────────────────┐
    │   │ Create Account                   [h1]  │
    │   │ (text-2xl text-center mb-8 — Montserrat,│
    │   │  same rule as login.md: Julius is for  │
    │   │  brand moments, not utility pages)     │
    │   │                                        │
    │   │ <p class="text-sm text-white/60         │
    │   │   text-center mb-6">                   │
    │   │   Sign up to like releases, follow      │
    │   │   artists, and bookmark videos.        │
    │   │ </p>                                   │
    │   │ (Optional value-statement — the why    │
    │   │  for new accounts. Helps conversion;   │
    │   │  drop if too marketing-y for the brand)│
    │   └────────────────────────────────────────┘
    │
    ├── FORM
    │   ┌────────────────────────────────────────┐
    │   │ <form @submit.prevent="signUp">        │
    │   │   bg-white/5 backdrop-blur-sm           │
    │   │   border border-white/20 rounded-lg p-6│
    │   │   flex flex-col gap-4                   │
    │   │                                        │
    │   │ Email:                                 │
    │   │   autocomplete="email" required        │
    │   │                                        │
    │   │ Password (with show-toggle):           │
    │   │   autocomplete="new-password"          │
    │   │   minlength="8" required               │
    │   │                                        │
    │   │   Hint below input:                    │
    │   │   <p class="text-xs text-white/40">    │
    │   │     At least 8 characters.             │
    │   │   </p>                                 │
    │   │                                        │
    │   │ (OPTIONAL) Confirm password:           │
    │   │   autocomplete="new-password"          │
    │   │   - Add only if Supabase doesn't       │
    │   │     enforce confirmation by default.   │
    │   │   - Live-validates equality client-    │
    │   │     side; submit blocked while         │
    │   │     mismatched.                        │
    │   │                                        │
    │   │ Terms checkbox:                        │
    │   │   <label class="flex items-start       │
    │   │     gap-2 text-xs text-white/60">      │
    │   │     <input type="checkbox" required    │
    │   │       class="mt-0.5">                  │
    │   │     <span>                             │
    │   │       I agree to the                   │
    │   │       <NuxtLink to="/terms"            │
    │   │         class="underline               │
    │   │         hover:text-white">Terms</NuxtLink> │
    │   │       and                              │
    │   │       <NuxtLink to="/privacy"          │
    │   │         class="underline               │
    │   │         hover:text-white">Privacy      │
    │   │       Policy</NuxtLink>.               │
    │   │     </span>                            │
    │   │   </label>                             │
    │   │   (Required if /terms and /privacy     │
    │   │    pages exist. If they don't yet:     │
    │   │    omit the checkbox in v1 and add     │
    │   │    when legal pages ship.)             │
    │   │                                        │
    │   │ Error / message regions (same as       │
    │   │ login.md, role="alert" / role="status")│
    │   │                                        │
    │   │ Submit:                                │
    │   │   "Create account" / "Creating…"       │
    │   │   on success: show inline message      │
    │   │   "Check your email to confirm your    │
    │   │   account." (do NOT navigate; user     │
    │   │   needs to act on email)               │
    │   └────────────────────────────────────────┘
    │
    ├── CONFIRMATION HINT (post-success state)
    │   ┌────────────────────────────────────────┐
    │   │ Visible only after successful signup.  │
    │   │                                        │
    │   │ <div class="text-sm text-white/70      │
    │   │   bg-white/5 border border-white/10    │
    │   │   rounded p-4 mt-4 text-center"        │
    │   │   role="status">                       │
    │   │   We sent a confirmation link to       │
    │   │   {{ email }}. Click it to activate    │
    │   │   your account.                        │
    │   │                                        │
    │   │   Didn't get it? Check spam, or        │
    │   │   <button @click="resendConfirm"       │
    │   │     class="underline hover:text-white">│
    │   │     resend                             │
    │   │   </button>.                           │
    │   │ </div>                                 │
    │   └────────────────────────────────────────┘
    │
    └── FOOTER LINK
        ┌────────────────────────────────────────┐
        │ Already have an account?               │
        │ <NuxtLink to="/login"                  │
        │   class="text-white/70 hover:text-     │
        │   white underline ml-1">               │
        │   Sign in                              │
        │ </NuxtLink>                            │
        └────────────────────────────────────────┘
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.** Tokens **identical** to `pages/login.md` for the form surface, with these additions:

| Token | Value | Scope |
|-------|-------|-------|
| Value-statement copy | `text-sm text-white/60 text-center mb-6` | optional motivational paragraph under h1 |
| Password hint | `text-xs text-white/40 mt-1` | "At least 8 characters." |
| Terms checkbox row | `flex items-start gap-2 text-xs text-white/60 mt-2` | terms agreement |
| Terms link | `underline hover:text-white` | /terms and /privacy links |
| Confirmation hint box | `text-sm text-white/70 bg-white/5 border border-white/10 rounded p-4 mt-4 text-center` | post-signup success card |
| Resend button | `underline hover:text-white` (inline `<button>`) | resend confirmation email |

## Components

**Reuse:**
- Same form pattern as `pages/login.md` (form surface, inputs, password show-toggle)
- `<NuxtLink>` for /login footer + /terms + /privacy
- `<Icon>` Heroicons
- `useAuth` composable (`signUp` method) — see `pages/login.md` for the composable contract

**Do not introduce:**
- ❌ A wizard / multi-step signup. Single-screen form is correct for v1.
- ❌ Captcha (defer until measurable abuse).
- ❌ Social signup buttons (defer with login OAuth).

## Data

```ts
// app/pages/signup.vue
const { signUp, user } = useAuth()
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')   // optional, see Layout
const acceptTerms = ref(false)    // when /terms and /privacy exist
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

watchEffect(() => {
  // Already-logged-in users don't see signup
  if (user.value) navigateTo('/profile')
})

const passwordValid = computed(() => password.value.length >= 8)
const passwordMatches = computed(() => password.value === passwordConfirm.value)
const canSubmit = computed(() =>
  email.value && passwordValid.value
    && (passwordConfirm.value === '' || passwordMatches.value)
    && (!useTermsCheckbox.value || acceptTerms.value)
)

async function submit() {
  if (!canSubmit.value) return
  loading.value = true; error.value = ''
  const { error: err } = await signUp(email.value, password.value)
  if (err) error.value = err.message
  else success.value = true
  loading.value = false
}

async function resendConfirm() {
  // Supabase has resend flow; verify exact API in implementation
}
```

## Interactions specific to this page

- **Submit:** disabled until form is valid (email present, password ≥8 chars, optional confirm matches, terms accepted when checkbox required).
- **Success state:** form remains visible but disabled; confirmation-hint box appears below submit. User stays on `/signup` (does NOT auto-navigate to `/login` or `/profile`).
- **Email confirmation flow:** Supabase sends confirmation email; user clicks link → lands on `/confirm` (existing page) → redirected to `/profile` once auth event fires.
- **Resend confirmation:** clickable inline button inside confirmation-hint box; rate-limited at the Supabase layer.
- **Already-logged-in:** redirect to `/profile` (same as login).
- **Password show-toggle:** identical behaviour to login.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Create Account</h1>` only.
- Each `<label>` paired with input via `for`.
- `autocomplete="email"` on email; `autocomplete="new-password"` on password and confirm (critical for password managers to suggest a strong new password).
- Password hint as descriptive text (`<p>` after the field) with `aria-describedby` linking to the password input's `id`.
- Terms checkbox: clickable label area covers the entire `<span>` per HTML defaults.
- Error region: `role="alert"`. Success / confirmation hint: `role="status"`.
- Submit disabled state: `aria-disabled="true"` (or use `disabled` directly + visual pattern).
- All `:focus-visible` rings; submit button ≥44pt; checkbox ≥24px hit area, but the wrapping `<label>` extends the click region.

## Anti-patterns specific to this page

- ❌ **Do not auto-navigate on signup success.** User must verify email; they need to see the confirmation-hint card.
- ❌ **Do not silently fail when terms unchecked.** Disable submit visibly; hint why on hover/focus if needed.
- ❌ **Do not include "username" / display name field in v1.** Email-only is the simplest credential; profile name can be set later in `/profile`.
- ❌ **Do not collect demographic / marketing data on signup.** Friction kills conversion; ask later if needed.
- ❌ **Do not show password strength meter** at v1. minlength=8 + Supabase server-side rules suffice; meters are tricky to localise and accessible.
- ❌ **Do not import the signin form into this page.** Duplicate the small form template — they will diverge as features land (OAuth, 2FA, terms versioning).
- ❌ **Do not pre-check the terms checkbox.** Pre-checked consents are illegal in many jurisdictions (GDPR, CPRA).
- ❌ **Do not redirect to `/login` on success.** Stay on `/signup` so the confirmation-hint stays visible.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] `<h1>Create Account</h1>` (Montserrat, NOT Julius)
- [ ] Optional value-statement paragraph (decision documented if dropped)
- [ ] Form with email + password + (optional) confirm + (optional) terms checkbox
- [ ] Password hint: "At least 8 characters."
- [ ] Confirmation-hint box renders only after successful signup, includes resend button
- [ ] "Already have an account? Sign in →" footer link points to `/login`
- [ ] Heading hierarchy: h1 only

### Behaviour

- [ ] Submit disabled until form valid (email + password length + confirm match + terms when present)
- [ ] On success: form remains, confirmation-hint shown
- [ ] User does NOT auto-navigate
- [ ] Resend button calls Supabase resend OTP / signup API, shows toast on success
- [ ] Already-authenticated redirect to `/profile`
- [ ] Password manager generates strong password (verified with 1Password / Apple Keychain)
- [ ] Errors render inline with `role="alert"`

### Data

- [ ] Uses shared `useAuth` composable (`signUp` method)
- [ ] No custom validation library; HTML5 + computed flags
- [ ] Terms acceptance only enforced when `/terms` and `/privacy` pages exist

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Confirmation hint legible against form-skim background
- [ ] All `:focus-visible` rings + `v-wave` on submit + show-password toggle

## Out of scope (deferred / open questions)

- **OAuth signup** — pair with login OAuth.
- **Username / display name** — defer to profile edit flow.
- **Email-only magic link signup** — simpler than password; defer until product decision.
- **CAPTCHA** — wait for actual abuse signal.
- **Newsletter consent checkbox** — legal-sensitive; pair with email-marketing integration.
- **Marketing consent vs functional consent** — separate the two when GDPR cookie consent is added.
- **Age gate** — not currently required; defer.
- **Referral code / invite system** — not in current product scope.

## Cross-references

- `pages/login.md`: paired sign-in page; tokens identical for form surface.
- `app/pages/confirm.vue`: existing email-confirmation handler. Receives the redirect from Supabase confirmation link.
- `pages/profile.md`: post-confirmation destination.
- Refactor backlog #2: `useDefaultSeo`.
- MASTER §Typography: Julius reserved for brand moments — auth h1 stays Montserrat.
- `useAuth` composable contract documented in `pages/login.md`.
