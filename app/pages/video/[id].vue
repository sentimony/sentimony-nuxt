<script setup lang="ts">
const { id } = useRoute().params;
const { data: item } = await useVideo(id as string, {
  server: true,
  default: () => ({}),
});

// Compute embeddable YouTube URL from short link
const { embed } = useYouTube(computed(() => item.value?.links?.youtube))
const { formatDate } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))

useSeoMeta({
  title: item.value.title,
  description: item.value.title + ' description',
  ogImage: item.value.cover_og,
});
</script>

<template>
  <div class="text-left">
    <div class="px-2">

      <div class="container relative mb-10">

        <div class="border-t border-white/30">
          <h1 class="text-center mt-[0.8em] mb-[1.2em]">{{ item.title }}</h1>
        </div>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4">

            <OpenImage 
              :image_th="item.cover_th"
              :image_xl="item.cover_xl"
              :alt="(item.title || 'Video') + ' cover'"
              class="float-left"
            />

            <p><span class="text-white/50">Release Date:</span> {{ formattedDate }}</p>

            <div class="clear-left">
            </div>

          </div>
          <div class="max-w-[540px] mx-auto w-full mb-4">

            <Tabs>
              <Tab
                v-if="item.links?.youtube"
                icon="cib:bandcamp"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video"
                    :src="embed"
                    :title="item.title + 'YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  />
                </div>
              </Tab>
            </Tabs>

          </div>
        </div>
      
      </div>
    </div>

    <img src="/images/triangle.svg" alt="triangle bg" />

    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px] bg-[#e0ebe0] text-black" v-if="item">
      <div class="container">
        <div class="max-w-[640px] mx-auto">

          <div v-if="item.information" v-html="item.information" />
          
          <div v-if="item.credits" v-html="item.credits" />

        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss"></style>
