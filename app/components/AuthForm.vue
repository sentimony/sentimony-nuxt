<script setup lang="ts">
const props = defineProps<{ mode: 'signin' | 'signup' | 'forgot' }>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value && props.mode !== 'forgot') navigateTo('/profile')
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

const title = computed(() => ({
  signin: 'Sign In',
  signup: 'Create Account',
  forgot: 'Reset Password',
}[props.mode]))

const submitLabel = computed(() => ({
  signin: 'Sign In',
  signup: 'Sign Up',
  forgot: 'Send Reset Link',
}[props.mode]))

async function submit() {
  loading.value = true
  error.value = ''
  message.value = ''

  if (props.mode === 'signin') {
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (err) error.value = err.message
    else navigateTo('/profile')
  } else if (props.mode === 'signup') {
    const { error: err } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (err) error.value = err.message
    else message.value = 'Check your email to confirm your account.'
  } else {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) error.value = err.message
    else message.value = 'Check your email for the password reset link.'
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">
        {{ title }}
      </h1>

      <Card class="border-white/20 backdrop-blur-sm text-left">
        <CardContent>
          <form @submit.prevent="submit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <Label for="email" class="text-xs text-white/50 tracking-widest uppercase">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="your@email.com"
              />
            </div>

            <div v-if="mode !== 'forgot'" class="flex flex-col gap-1.5">
              <Label for="password" class="text-xs text-white/50 tracking-widest uppercase">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
                  placeholder="••••••••"
                  class="pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-white/40 hover:text-white/80 transition-colors"
                >
                  <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" size="18" />
                </button>
              </div>
              <NuxtLink
                v-if="mode === 'signin'"
                to="/forgot-password"
                class="self-end mt-1 text-xs text-white/40 hover:text-white/70 underline cursor-pointer"
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
              {{ loading ? 'Loading…' : submitLabel }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div class="text-center mt-4 text-sm text-white/40">
        <span v-if="mode === 'signin'">
          No account?
          <NuxtLink to="/signup" class="cursor-pointer text-white/70 hover:text-white underline ml-1">Sign Up</NuxtLink>
        </span>
        <span v-else-if="mode === 'signup'">
          Already have an account?
          <NuxtLink to="/signin" class="cursor-pointer text-white/70 hover:text-white underline ml-1">Sign In</NuxtLink>
        </span>
        <span v-else>
          Remembered it?
          <NuxtLink to="/signin" class="cursor-pointer text-white/70 hover:text-white underline ml-1">Sign In</NuxtLink>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff;
  transition: background-color 600000s 0s, -webkit-text-fill-color 600000s 0s;
}
</style>
