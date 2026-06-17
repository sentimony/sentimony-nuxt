<template>
  <div class="Content px-2 pt-2 pb-7.5 md:pb-15">
    <div class="opacity-85">
      <SvgTriangle />
      <div class="ContentBg" />
    </div>
    <div class="relative z-2 max-w-160 mx-auto">
      <slot />
    </div>
  </div>
</template>
