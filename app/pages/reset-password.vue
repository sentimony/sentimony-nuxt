<script setup lang="ts">
const supabase = useSupabaseClient()

const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  message.value = ''

  const { error: err } = await supabase.auth.updateUser({ password: password.value })
  if (err) error.value = err.message
  else {
    message.value = 'Password updated. Redirecting…'
    setTimeout(() => navigateTo('/profile'), 1500)
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">
        New Password
      </h1>

      <Card class="border-white/20 backdrop-blur-sm text-left">
        <CardContent>
          <form @submit.prevent="submit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <Label for="password" class="text-xs text-white/50 tracking-widest uppercase">New Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
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
            </div>

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <Alert v-if="message" class="text-green-400">
              <AlertDescription class="text-green-400/90">{{ message }}</AlertDescription>
            </Alert>

            <Button type="submit" variant="outline" :disabled="loading" class="w-full cursor-pointer">
              {{ loading ? 'Loading…' : 'Update Password' }}
            </Button>
          </form>
        </CardContent>
      </Card>
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
