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

      const { error: err } = await supabase.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: { emailRedirectTo: `${window.location.origin}/confirm` },
      })
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
  <AuthCard :title="title" :error="error" :message="message" novalidate @submit="submit">
    <div class="flex flex-col gap-1.5">
      <Label for="email" class="text-xs text-muted-foreground tracking-widest uppercase">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="your@email.com"
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? 'email-error' : undefined"
      />
      <span v-if="errors.email" id="email-error" role="alert" class="text-xs text-destructive">{{ errors.email }}</span>
    </div>

    <div v-if="mode !== 'forgot'" class="flex flex-col gap-1.5">
      <Label for="password" class="text-xs text-muted-foreground tracking-widest uppercase">Password</Label>
      <PasswordInput
        id="password"
        v-model="password"
        :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
        :invalid="!!errors.password"
        :described-by="errors.password ? 'password-error' : undefined"
      />
      <span v-if="errors.password" id="password-error" role="alert" class="text-xs text-destructive">{{ errors.password }}</span>
      <NuxtLink
        v-if="mode === 'signin'"
        to="/forgot-password"
        class="self-end mt-1 text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
      >
        Forgot password?
      </NuxtLink>
    </div>

    <template #actions>
      <Button type="submit" variant="submit" :disabled="loading" class="w-full cursor-pointer">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        <Icon v-else-if="mode !== 'forgot'" name="lucide:log-in" />
        {{ submitLabel }}
      </Button>
    </template>

    <template #footer>
      <div class="text-center mt-4 text-sm text-muted-foreground">
        <span v-if="mode === 'signin'">
          Don't have an account?
          <NuxtLink to="/signup" class="cursor-pointer text-foreground hover:text-foreground/70 underline ml-1">Sign Up</NuxtLink>
        </span>
        <span v-else-if="mode === 'signup'">
          Already have an account?
          <NuxtLink to="/signin" class="cursor-pointer text-foreground hover:text-foreground/70 underline ml-1">Sign In</NuxtLink>
        </span>
        <span v-else>
          Remembered it?
          <NuxtLink to="/signin" class="cursor-pointer text-foreground hover:text-foreground/70 underline ml-1">Sign In</NuxtLink>
        </span>
      </div>
    </template>
  </AuthCard>
</template>
