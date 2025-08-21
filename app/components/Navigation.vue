<script setup lang="ts"></script>

<template>
  <div class="text-center">
    <div>Navigation Component</div>

    <div>
      <NuxtLink to="/">[
        <Icon name="mdi:home" width="24" height="24" />
        Home
      ]</NuxtLink> | 
      <NuxtLink to="/releases">[ 
        <Icon name="mdi:music" width="24" height="24" />
      Releases]</NuxtLink> | 
      <NuxtLink to="/artists">[
        <Icon name="mdi:artist" width="24" height="24" />
        Artists
      ]</NuxtLink> | 
      <NuxtLink to="/videos">[
        <Icon name="mdi:video-vintage" width="24" height="24" />
        Videos
      ]</NuxtLink> | 
      <NuxtLink to="/playlists">[
        <Icon name="mdi:playlist-music" width="24" height="24" />
        Playlists
      ]</NuxtLink>
      <NuxtLink to="/contacts">[
        <Icon name="mdi:gmail" width="24" height="24" />
        Contacts
      ]</NuxtLink>
    </div>

    <div>
      <NuxtLink to="/events">[
        <Icon name="mdi:event" width="24" height="24" />
        Events
      ]</NuxtLink> | 
      <NuxtLink to="/friends">[
        <!-- <Icon name="mdi:event" width="24" height="24" /> -->
        Friends
      ]</NuxtLink> | 
      <NuxtLink to="/news">[
        <!-- <Icon name="mdi:event" width="24" height="24" /> -->
        News
      ]</NuxtLink> | 
      <NuxtLink to="/tracks">[
        <!-- <Icon name="mdi:bug" width="24" height="24" /> -->
        Tracks
      ]</NuxtLink>
      <NuxtLink to="/sitemap">[
        <!-- <Icon name="mdi:bug" width="24" height="24" /> -->
        Sitemap
      ]</NuxtLink>
      <NuxtLink to="/ddos">[
        <!-- <Icon name="mdi:bug" width="24" height="24" /> -->
        Ddos
      ]</NuxtLink>
    </div>

  </div>
</template>

<style lang="scss" scoped></style>
