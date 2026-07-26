<script setup lang="ts">
defineProps<{
  id: string
  autocomplete: string
  invalid?: boolean
  describedBy?: string
}>()

const model = defineModel<string>({ required: true })
const show = ref(false)
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      v-model="model"
      :type="show ? 'text' : 'password'"
      required
      :autocomplete="autocomplete"
      placeholder="••••••••"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
      class="pr-10"
    />
    <button
      type="button"
      :aria-label="show ? 'Hide password' : 'Show password'"
      :aria-pressed="show"
      @click="show = !show"
      class="password-toggle absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-[color]"
    >
      <Icon :name="show ? 'lucide:eye-closed' : 'lucide:eye'" size="18" />
    </button>
  </div>
</template>
