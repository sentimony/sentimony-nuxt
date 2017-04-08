<template>
  <nuxt-link class='logolink' to='/' exact>
    <img class="logolink__logo" src="/svg-icons/sentimony-records-logo.svg">
    <div class="logolink__text">
      <div class="logolink__title">Sentimony Records</div>
      <div class="logolink__subtitle">Psychill Music Label</div>
    </div>
  </nuxt-link>
</template>

<style lang="scss">
.logolink {
  display: flex;
  align-items: center;

  &__logo {
    width: 40px;
    display: block;
    margin-right: 24px;
  }

  &__text {
    text-align: left;
  }

  &__title {
    font-size: 16px;
    color: #fff;
  }

  &__subtitle {
    font-size: 14px;
    color: rgba(#fff,.4);
  }
}
</style>
