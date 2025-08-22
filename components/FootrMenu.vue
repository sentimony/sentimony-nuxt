<template>
  <div class="FootrMenu">
    <div class="FootrMenu__wrapper">
      <div class="FootrMenu__list">
        <router-link
          v-for="(i, index) in menu"
          :key="index"
          v-if="i.visibleFooter"
          v-ripple
          :to="i.route"
          class="FootrMenu__link"
          active-class="isSelected"
          :class="{ 'isSelected': isSelected(i) }"
          exact
          v-html="i.title"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AppContent from '@/plugins/AppContent';

export default {
  data: () => ({
    menu: AppContent.menu,
  }),
  methods: {
    isSelected(i) { return i.match(this.$route.path) }
  }
}
</script>

<style lang="scss">
.FootrMenu {
  margin: 0 auto 2em;

  &__wrapper {
    display: inline-block;
  }

  &__list {
    border: 1px solid rgba(#fff, 0.1);
    border-width: 1px 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__link {
    padding: 0.6em;
    background-color: rgba(#fff, 0);
    transition: background-color 0.2s ease;
    color: #fff;

    &.isSelected,
    &:hover {
      background-color: rgba(#fff, 0.1);
    }
  }
}
</style>
