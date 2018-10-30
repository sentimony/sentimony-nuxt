<template>
  <div class="fractal">
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
    <div class="fractal__petal"></div>
  </div>
</template>

<script>
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';

  .fractal {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;

    @include media(M) {
      display: block;
    }

    &__petal {
      transform: translate3d(-50%,-50%,0);
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: 0;
      margin-left: 0;
      transition: all 5.25s ease-in-out;

      &:after {
        content:'';
        width: 125px;
        height: 250px;
        background: radial-gradient(ellipse at 50% 0,
          rgba(#fff, .15) 0%,
          rgba(#8a0202, 0) 50%,
          rgba(#000, .15) 100%);
        border-radius: 50%;
        position: absolute;
        transition: all 5.25s ease-in-out;
        animation: turn 5.0s ease-in-out infinite;
      }
    }
  }

  @for $i from 1 through 24 {
    .fractal__petal:nth-child(#{$i}) {
      transform: rotate($i*15deg);
    }
  }

  @keyframes turn {
    100% {
      transform:rotate(1turn);
    }
  }
</style>
