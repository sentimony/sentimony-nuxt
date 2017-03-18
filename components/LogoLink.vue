<template>
  <div class='logolink'>
    <img class="logolink__img" src="/svg-icons/sentimony-records-logo.svg">
    <div class="logolink__text">
      <div class="logolink__title">Sentimony Records</div>
      <div class="logolink__subtitle">Electronic Music Label</div>
    </div>
  </div>
</template>

<style lang="scss">
.logolink {
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
