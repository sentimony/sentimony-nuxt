<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) navigateTo('/profile')
})

const email = ref('')
const password = ref('')
const mode = ref<'signin' | 'signup'>('signin')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  message.value = ''

  if (mode.value === 'signin') {
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (err) error.value = err.message
    else navigateTo('/profile')
  } else {
    const { error: err } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (err) error.value = err.message
    else message.value = 'Check your email to confirm your account.'
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">
        {{ mode === 'signin' ? 'Sign In' : 'Create Account' }}
      </h1>

      <form @submit.prevent="submit" class="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-white/50 tracking-widest uppercase">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="your@email.com"
            class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/50 transition-colors"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-white/50 tracking-widest uppercase">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full bg-white/10 border border-white/20 rounded px-3 py-2 pr-10 text-white placeholder-white/30 outline-none focus:border-white/50 transition-colors"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            >
              <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" size="18" />
            </button>
          </div>
        </div>

        <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>
        <div v-if="message" class="text-green-400 text-sm">{{ message }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="transition-colors duration-300 border border-white/30 rounded px-4 py-2 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up' }}
        </button>
      </form>

      <div class="text-center mt-4 text-sm text-white/40">
        <span v-if="mode === 'signin'">
          No account?
          <button class="text-white/70 hover:text-white underline ml-1" @click="mode = 'signup'">Sign up</button>
        </span>
        <span v-else>
          Already have an account?
          <button class="text-white/70 hover:text-white underline ml-1" @click="mode = 'signin'">Sign in</button>
        </span>
      </div>
    </div>
  </div>
</template>
