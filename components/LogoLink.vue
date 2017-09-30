<template>
  <nuxt-link  to='/' class='logolink' exact-active-class="is-selected" exact>
    <img class="logolink__logo" src="https://sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg" :alt="siteTitle + 'Logo SVG'">
    <div class="logolink__text">
      <div class="logolink__title">{{ siteTitle }}</div>
      <div class="logolink__description">{{ siteDescription }}</div>
    </div>
  </nuxt-link>
</template>

<script>
export default {
  data: () => ({
    siteTitle: 'Sentimony Records',
    siteDescription: 'Psychedelic Music Label'
  })
}
</script>

<style lang="scss">
@import '../assets/scss/main';

.headr__main-menu-link {
  padding: .938em .938em*1.5;
  font-size: 16px;
  color: #fff;
  border-radius: 6px;
  transition: background-color .2s ease-in-out;
  margin-left: .2em;

  &:first-child {
    margin-left: 0;
  }

  &.is-selected,
  &:hover {
    background-color: $colorBgLight;
  }
}

.logolink {
  @extend .headr__main-menu-link;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 232px;
  height: 54px;
  padding: 0;

  &__logo {
    width: 40px;
    display: block;
    margin-right: .792em;
  }

  &__text {
    text-align: left;
  }

  &__title {
    color: #fff;
  }

  &__description {
    font-size: 12px;
    color: rgba(#fff,.4);
    letter-spacing: .4px;
  }
}
</style>
