<template>
  <div class="flex-sticky font-Montserrat text-center">
    <div class="flex-sticky__content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <div class="flex-sticky__footer">
      <Footer />
    </div>
  </div>
</template>

<style lang="scss">
html,
body,
#__nuxt,
#__layout {
  height: 100%;
}

.flex-sticky {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  &__content {
    flex: 1;
    position: relative;
    // padding: 2em .6em;
    // background-color: #000;
  }

  &__footer {
  }
}
</style>
