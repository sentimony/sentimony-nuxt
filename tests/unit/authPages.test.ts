import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('auth pages', () => {
  it('uses Sign In and Sign Up titles from AuthForm', () => {
    const authForm = readProjectFile('app/components/AuthForm.vue')

    expect(authForm).toContain("signin: 'Sign In'")
    expect(authForm).toContain("signup: 'Sign Up'")
    expect(authForm).toContain('useSeoMeta({')
    expect(authForm).toContain('title,')
  })

  it('keeps signin and signup pages mapped to the right modes', () => {
    const signinPage = readProjectFile('app/pages/signin.vue')
    const signupPage = readProjectFile('app/pages/signup.vue')
    const authForm = readProjectFile('app/components/AuthForm.vue')

    expect(signinPage).toContain('mode="signin"')
    expect(signupPage).toContain('mode="signup"')
    expect(authForm).toContain("/api/auth/email-exists")
    expect(authForm).toContain('Something went wrong. Please try again.')
  })
})
