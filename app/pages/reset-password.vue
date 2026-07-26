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
  <AuthCard title="New Password" :error="error" :message="message" @submit="submit">
    <div class="flex flex-col gap-1.5">
      <Label for="password" class="text-xs text-muted-foreground tracking-widest uppercase">New Password</Label>
      <PasswordInput
        id="password"
        v-model="password"
        autocomplete="new-password"
      />
    </div>

    <template #actions>
      <Button type="submit" variant="submit" :disabled="loading" class="w-full cursor-pointer">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        Update Password
      </Button>
    </template>
  </AuthCard>
</template>
