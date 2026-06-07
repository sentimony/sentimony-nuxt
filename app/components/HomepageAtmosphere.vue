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
  background: oklch(0.91 0.025 155);
}

.homepage-atmosphere::before {
  position: absolute;
  content: "";
  inset: -2vmax;
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-white_v1.jpg");
  background-repeat: no-repeat;
  background-position: 50% 44%;
  background-size: cover;
  transform: scale(1.02);
}

.dark .homepage-atmosphere {
  background: oklch(0.12 0.025 155);
}

.dark .homepage-atmosphere::before {
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?02");
  background-position: 50% 50%;
}

.dark body.homepage-route {
  background-color: oklch(0.12 0.025 155);
  background-image: none;
}

@media (max-width: 640px) {
  .homepage-atmosphere::before {
    background-position: 50% 50%;
    transform: scale(1.04);
  }
}
</style>
