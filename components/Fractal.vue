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

<style lang="scss">
.fractal {
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

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
        rgba(43,111,169, .5) 0%,
        rgba(164,232,58, 0) 50%,
        rgba(#1a96bc, .5) 100%);
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
