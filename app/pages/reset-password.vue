<script setup lang="ts">
const supabase = useSupabaseClient()

const password = ref('')
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

      <Card class="border-black/20 dark:border-white/20 backdrop-blur-sm text-left">
        <CardContent>
          <form @submit.prevent="submit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <Label for="password" class="text-xs text-foreground/50 tracking-widest uppercase">New Password</Label>
              <PasswordInput
                id="password"
                v-model="password"
                autocomplete="new-password"
              />
            </div>

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <Alert v-if="message" class="text-green-400">
              <AlertDescription class="text-green-400/90">{{ message }}</AlertDescription>
            </Alert>

            <Button type="submit" variant="outline" :disabled="loading" class="w-full cursor-pointer">
              <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
