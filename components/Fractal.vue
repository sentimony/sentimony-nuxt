<template>
  <div class="fractal">
    <div class="fractal__container">
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
  </div>
</template>

<style lang="scss">
.fractal {
  // position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  // padding: 5em .8em;
  // box-sizing: border-box;
  // z-index: 20;
  // opacity: .75;

  &__container {
    // position: relative;
    overflow: hidden;
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
      font-size: 8px;
      width: 125px;
      height: 250px;
      background: radial-gradient(ellipse at 50% 0,
        rgba(155,89,182,0.5) 0%,
        rgba(164,232,58,0.0) 50%,
        rgba(26,188,156,0.5) 100%);
      border-radius: 50%;
      position: absolute;
      transition: all 5.25s ease-in-out;
      animation: turn 5.0s ease-in-out infinite;
    }
  }
}

@for $i from 1 through 12 {
  .fractal__petal:nth-child(#{$i}) {
    transform: rotate($i*30deg);
  }
}

@keyframes turn {
  100% {
    transform:rotate(1turn);
  }
}
</style>
