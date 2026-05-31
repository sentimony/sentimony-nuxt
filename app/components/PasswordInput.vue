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
      class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-white/40 hover:text-white/80 transition-colors"
    >
      <Icon :name="show ? 'heroicons:eye-slash' : 'heroicons:eye'" size="18" />
    </button>
  </div>
</template>
