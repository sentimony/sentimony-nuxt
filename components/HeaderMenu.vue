<template>
  <div>
    <div class="HeaderMenu">
      <div class="HeaderMenu__container">

        <div style="width:232px">
          <HeaderLogolink />
        </div>

        <nav class="HeaderMenu__main-menu" v-if="$mq === 'lg'">
          <nuxt-link
            v-for="(i, index) in menu"
            :key="index"
            v-if="i.visibleHeader"
            v-ripple
            :to="i.route"
            class="HeaderMenu__main-menu-link"
            active-class="isSelected"
            :class="{ 'isSelected': isSelected(i) }"
            v-html="i.title"
          />
        </nav>

        <HeaderSocialMenu style="width:232px" v-if="$mq === 'lg'" />

      </div>
    </div>
  </div>
</template>

<script>
import HeaderLogolink from '@/components/HeaderLogolink.vue'
import HeaderSocialMenu from '@/components/HeaderSocialMenu.vue'
import AppContent from '@/plugins/AppContent';

export default {
  components: {
    HeaderLogolink,
    HeaderSocialMenu
  },
  data: () => ({
    menu: AppContent.menu,
  }),
  methods: {
    isSelected(i) { return i.match(this.$route.path) }
  }
}
</script>

<style lang="scss">
@use '@/assets/scss/coriolanMedia' as media;
@use '@/assets/scss/main-menu-link';

.HeaderMenu {
  position: relative;
  z-index: 700;
  padding: 0 0.6em;

  &__container {
    max-width: 1278px;
    margin: 0 auto;
    height: 75px;
    border-bottom: 1px solid rgba(#fff, 0.3);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__main-menu {

    &-link {
      @extend .main-menu-link;
      line-height: 16px;
      font-size: 14px;
      padding: 20px 16px;
      display: inline-block;

      @include media.media(L) {
        font-size: 16px;
        padding: 20px 16px * 1.75;
      }
    }
  }
}
</style>
