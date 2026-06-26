<script setup lang="ts">
import { useForm } from 'vee-validate'

const props = defineProps<{ mode: 'signin' | 'signup' | 'forgot' }>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value && props.mode !== 'forgot') navigateTo('/profile')
})

const loading = ref(false)
const message = ref('')
const error = ref('')
const signupExistsMessage = 'Something went wrong. Please try again.'

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const validationSchema = {
  email(value: string) {
    if (!value) return 'Email is required.'
    return emailRegex.test(value) || 'Please enter a valid email.'
  },
  password(value: string) {
    if (props.mode === 'forgot') return true
    if (!value) return 'Password is required.'
    if (props.mode === 'signup' && value.length < 6) return 'Password must be at least 6 characters.'
    return true
  },
}

const { defineField, errors, handleSubmit } = useForm<{ email: string; password: string }>({
  validationSchema,
  initialValues: { email: '', password: '' },
})
const [email] = defineField('email')
const [password] = defineField('password')

const title = computed(() => ({
  signin: 'Sign In',
  signup: 'Sign Up',
  forgot: 'Reset Password',
}[props.mode]))

useSeoMeta({
  title,
})

const submitLabel = computed(() => ({
  signin: 'Sign In',
  signup: 'Sign Up',
  forgot: 'Send Reset Link',
}[props.mode]))

const submit = handleSubmit(async () => {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const emailValue = String(email.value ?? '')
    const passwordValue = String(password.value ?? '')

    if (props.mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: emailValue, password: passwordValue })
      if (err) error.value = err.message
      else navigateTo('/profile')
    } else if (props.mode === 'signup') {
      const { exists } = await $fetch<{ exists: boolean }>('/api/auth/email-exists', {
        method: 'POST',
        body: { email: emailValue },
      })

      if (exists) {
        error.value = signupExistsMessage
        return
      }

      const { error: err } = await supabase.auth.signUp({ email: emailValue, password: passwordValue })
      if (err) error.value = err.message
      else message.value = 'Check your email to confirm your account.'
    } else {
      const { error: err } = await supabase.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) error.value = err.message
      else message.value = 'Check your email for the password reset link.'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">
        {{ title }}
      </h1>

      <Card class="border-black/20 dark:border-white/20 backdrop-blur-sm text-left">
        <CardContent>
          <form @submit="submit" novalidate class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <Label for="email" class="text-xs text-foreground/50 tracking-widest uppercase">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="your@email.com"
                :aria-invalid="!!errors.email"
              />
              <span v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</span>
            </div>

            <div v-if="mode !== 'forgot'" class="flex flex-col gap-1.5">
              <Label for="password" class="text-xs text-foreground/50 tracking-widest uppercase">Password</Label>
              <PasswordInput
                id="password"
                v-model="password"
                :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
                :invalid="!!errors.password"
              />
              <span v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</span>
              <NuxtLink
                v-if="mode === 'signin'"
                to="/forgot-password"
                class="self-end mt-1 text-xs text-foreground/40 hover:text-foreground/70 underline cursor-pointer"
              >
                Forgot password?
              </NuxtLink>
            </div>

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <Alert v-if="message" class="text-green-400">
              <AlertDescription class="text-green-400/90">{{ message }}</AlertDescription>
            </Alert>

            <Button type="submit" variant="outline" :disabled="loading" class="w-full cursor-pointer">
              <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
              <Icon v-else-if="mode !== 'forgot'" name="lucide:log-in" />
              {{ submitLabel }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div class="text-center mt-4 text-sm text-foreground/40">
        <span v-if="mode === 'signin'">
          Don't have an account?
          <NuxtLink to="/signup" class="cursor-pointer text-foreground/70 hover:text-foreground underline ml-1">Sign Up</NuxtLink>
        </span>
        <span v-else-if="mode === 'signup'">
          Already have an account?
          <NuxtLink to="/signin" class="cursor-pointer text-foreground/70 hover:text-foreground underline ml-1">Sign In</NuxtLink>
        </span>
        <span v-else>
          Remembered it?
          <NuxtLink to="/signin" class="cursor-pointer text-foreground/70 hover:text-foreground underline ml-1">Sign In</NuxtLink>
        </span>
      </div>
    </div>
  </div>
</template>
