<template>
  <div
    data-testid="homepage-atmosphere"
    class="homepage-atmosphere"
    aria-hidden="true"
  />
</template>

<style>
.homepage-atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background-color: #ffffff;
}

.homepage-atmosphere::before {
  position: absolute;
  content: "";
  inset: 0;
  z-index: 1;
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.33;
}

.homepage-atmosphere::after {
  position: absolute;
  content: "";
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(rgba(23, 102, 28, 0.33), rgba(23, 102, 28, 0.33)),
    linear-gradient(rgba(255, 255, 255, 0.44), rgba(255, 255, 255, 0.44));
}

.dark .homepage-atmosphere {
  background-color: #000000;
}

.dark .homepage-atmosphere::before {
  opacity: 0.17;
}

.dark .homepage-atmosphere::after {
  background: linear-gradient(rgba(23, 102, 28, 0.44), rgba(23, 102, 28, 0.44));
}

.dark body.homepage-route {
  background-color: #000000;
  background-image: none;
}

@media (max-width: 640px) {
  .homepage-atmosphere::before {
    background-position: center;
  }
}
</style>
