<template>
  <div class='logo-link'>
    <img class="logo-link__img" src="/svg-icons/sentimony-records-logo.svg">
    <div class="logo-link__text">
      <div class="logo-link__title">Sentimony Records</div>
      <div class="logo-link__subtitle">Electronic Music Label</div>
    </div>
  </div>
</template>

<style lang="scss">
.logo-link {
  display: flex;
  align-items: center;

  &__img {
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
