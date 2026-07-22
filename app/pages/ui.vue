<script setup lang="ts">
import { toast } from 'vue-sonner'

const inputValue = ref('')

useSeoMeta({
  title: 'UI Kit',
  description: 'Internal preview of the app UI components.',
})
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] container max-w-5xl px-4 py-8 md:py-12 flex flex-col gap-12">

      <h1 class="text-3xl md:text-4xl font-['Julius_Sans_One'] tracking-wide">UI Kit</h1>

      <section class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-widest text-foreground/50">Button</h2>
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="outline" v-wave>Outline</Button>
          <Button variant="outline" disabled>Disabled</Button>
          <Button variant="link" v-wave>Link</Button>
          <Button variant="glass" v-wave>Glass</Button>
          <Button variant="soft" v-wave>Soft</Button>
          <Button as-child variant="link">
            <NuxtLink to="/releases" v-wave>as-child link</NuxtLink>
          </Button>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-widest text-foreground/50">Alert</h2>
        <div class="flex flex-col gap-3 max-w-md">
          <Alert>
            <AlertDescription>Default alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertDescription>Something went wrong.</AlertDescription>
          </Alert>
          <Alert class="text-green-400">
            <AlertDescription class="text-green-400/90">Saved successfully.</AlertDescription>
          </Alert>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-widest text-foreground/50">Card</h2>
        <Card class="border-black/20 dark:border-white/20 backdrop-blur-sm max-w-md">
          <CardContent>
            <p>Card content lives inside <code>CardContent</code>.</p>
          </CardContent>
        </Card>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-widest text-foreground/50">Input &amp; Label</h2>
        <div class="flex flex-col gap-1.5 max-w-md">
          <Label for="demo-input" class="text-xs text-foreground/50 tracking-widest uppercase">Email</Label>
          <Input id="demo-input" v-model="inputValue" placeholder="your@email.com" />
          <p class="text-sm text-foreground/50">Value: {{ inputValue || '—' }}</p>
          <Input placeholder="Disabled input" disabled class="mt-2" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-widest text-foreground/50">Tooltip</h2>
        <TooltipProvider :delay-duration="0">
          <div class="flex flex-wrap gap-3">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent side="top">Tooltip on top</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline">And me</Button>
              </TooltipTrigger>
              <TooltipContent side="right" class="bg-emerald-900 text-white" arrow-class="bg-emerald-900 fill-emerald-900">
                Custom colour
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-widest text-foreground/50">Toaster (sonner)</h2>
        <div class="flex flex-wrap gap-3">
          <Button variant="outline" @click="toast('Default toast')">Default</Button>
          <Button variant="outline" @click="toast.success('Success toast')">Success</Button>
          <Button variant="outline" @click="toast.error('Error toast')">Error</Button>
          <Button variant="outline" @click="toast.info('Info toast')">Info</Button>
          <Button variant="outline" @click="toast.warning('Warning toast')">Warning</Button>
        </div>
      </section>

    </div>
  </div>
</template>
