<script setup lang="ts">
import { computed, provide } from 'vue'
import { createTabsContext, tabsKey } from '~/utils/tabs'

const tabsContext = createTabsContext()
const { tabs, selected } = tabsContext

provide(tabsKey, tabsContext)

const hideTitles = computed(() => tabs.length >= 5)

function plainTitle(title?: string) {
  return title ? title.replace(/<[^>]+>/g, '') : undefined
}
</script>

<template>
  <ClientOnly>
    <TabsRoot v-model="selected" :unmount-on-hide="false">

      <TabsList>
        <TooltipProvider v-for="tab in tabs" :key="tab.id" :delay-duration="0">
          <Tooltip>
            <TooltipTrigger as-child>
              <TabsTrigger
                :value="tab.id"
                class="inline-flex items-center cursor-pointer h-[36px] md:h-[42px] text-[8px] md:text-[12px] tracking-tighter rounded-t-lg transition-opacity ease-in-out duration-300 text-foreground bg-white/50 dark:bg-white/30 px-3 md:px-4 mr-1 md:mr-1 last:mr-0 backdrop-blur-sm opacity-50 hover:opacity-100 data-[state=active]:opacity-100"
                v-wave
              >
                <Icon v-if="tab.info.icon" :name="tab.info.icon" size="18" />
                <img v-else-if="tab.info.img" :src="tab.info.img" :alt="plainTitle(tab.info.title) || ''" width="18" height="18">
                <span v-if="tab.info.title && !hideTitles" v-html="tab.info.title" class="ml-2" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent v-if="tab.info.title && hideTitles" side="top">
              {{ plainTitle(tab.info.title) }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TabsList>

      <slot />

    </TabsRoot>
  </ClientOnly>
</template>
