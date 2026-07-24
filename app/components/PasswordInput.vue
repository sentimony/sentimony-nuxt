<script setup lang="ts">
defineProps<{
  id: string
  autocomplete: string
  invalid?: boolean
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
      class="pr-10"
    />
    <button
      type="button"
      @click="show = !show"
      class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-foreground/40 hover:text-foreground/80 transition-colors"
    >
      <Icon :name="show ? 'lucide:eye-closed' : 'lucide:eye'" size="18" />
    </button>
  </div>
</template>
