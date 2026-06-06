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

.homepage-atmosphere::before,
.homepage-atmosphere::after {
  position: absolute;
  content: "";
}

.homepage-atmosphere::before {
  inset: -2vmax;
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg");
  background-repeat: no-repeat;
  background-position: 50% 44%;
  background-size: cover;
  filter: brightness(1.28) contrast(0.68) saturate(0.58);
  transform: scale(1.02);
}

.homepage-atmosphere::after {
  inset: 0;
  background:
    radial-gradient(
      circle at 50% 38%,
      oklch(1 0 0 / 58%) 0%,
      oklch(0.97 0.01 155 / 28%) 34%,
      transparent 58%
    ),
    linear-gradient(
      to bottom,
      oklch(0.97 0.01 155 / 72%) 0%,
      oklch(0.92 0.02 155 / 48%) 52%,
      oklch(0.88 0.025 155 / 70%) 100%
    );
}

.dark .homepage-atmosphere {
  background: oklch(0.12 0.025 155);
}

.dark .homepage-atmosphere::before {
  background-image: url("https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?02");
  background-position: 50% 50%;
  filter: none;
}

.dark .homepage-atmosphere::after {
  background: none;
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
