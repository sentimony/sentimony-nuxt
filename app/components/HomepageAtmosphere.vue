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
  inset: 0;
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-light_v1.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.dark .homepage-atmosphere {
  background: oklch(0.12 0.025 155);
}

.dark .homepage-atmosphere::before {
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-dark_v1.jpg");
}

.dark body.homepage-route {
  background-color: oklch(0.12 0.025 155);
  background-image: none;
}

@media (max-width: 640px) {
  .homepage-atmosphere::before {
    background-position: center;
  }
}
</style>
