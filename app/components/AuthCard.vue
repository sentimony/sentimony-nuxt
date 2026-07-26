<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  error?: string
  message?: string
  novalidate?: boolean
}>(), { error: '', message: '', novalidate: false })

const emit = defineEmits<{ submit: [event: Event] }>()
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">
        {{ title }}
      </h1>

      <Card class="border-foreground/20 backdrop-blur-md text-left">
        <CardContent>
          <form :novalidate="novalidate" class="flex flex-col gap-4" @submit.prevent="emit('submit', $event)">
            <slot />

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <Alert v-if="message" variant="success">
              <AlertDescription>{{ message }}</AlertDescription>
            </Alert>

            <slot name="actions" />
          </form>
        </CardContent>
      </Card>

      <slot name="footer" />
    </div>
  </div>
</template>
