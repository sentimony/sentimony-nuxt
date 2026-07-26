<script setup lang="ts">
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) navigateTo('/profile')
})
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="text-center text-muted-foreground">Confirming your account...</div>
  </div>
</template>
