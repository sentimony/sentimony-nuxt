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
  background-image: var(--forest-bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0;
  transition: opacity 1.2s ease-in;
}

.forest-ready .homepage-atmosphere::before {
  opacity: 0.33;
}

.homepage-atmosphere::after {
  position: absolute;
  content: "";
  inset: 0;
  z-index: 2;
  background: var(--forest-tint);
}

.dark .homepage-atmosphere {
  background-color: #000000;
}

.dark.forest-ready .homepage-atmosphere::before {
  opacity: 0.17;
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
