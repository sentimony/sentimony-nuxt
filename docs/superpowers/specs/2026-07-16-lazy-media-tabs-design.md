# Lazy Media Tabs and Simplified Inline Players

## Goal

Reduce unnecessary third-party player requests on release, artist, video, playlist, and track detail pages, and simplify the controls shown by the inline Sentimony audio players.

## Scope

- Detail pages using the shared `Tabs` and `Tab` components.
- `AudioTrackPlaylist` on release pages.
- `AudioMixPlayer` on artist pages.
- The global bottom audio player is unchanged.

## Tab behavior

The first registered tab remains the initially selected tab and its content mounts immediately. This preserves the configured default on pages that do not have a Sentimony tab.

Content for every other tab remains unmounted until the user selects that tab. After a tab has been selected once, its content stays mounted when the user switches away, preserving iframe and playback state.

The shared tab components own this behavior so release, artist, video, playlist, and track pages receive the same loading policy without page-specific iframe conditions.

## Inline player controls

`AudioTrackPlaylist` and `AudioMixPlayer` stop rendering:

- the volume icon and volume range control;
- the total-duration value at the right side of the seek control.

They retain play/pause, the seek control, and elapsed time. `AudioTrackPlaylist` also retains previous/next controls and its clickable track list. Volume and full duration remain available in the global bottom player after playback starts.

## State and lifecycle

`Tabs` continues to track the selected tab. It also tracks tab IDs whose content may render. The initial tab enters that set during registration; later tabs enter it when selected. `Tab` receives a shared predicate from `Tabs` and renders its slot only when its ID has been activated.

Unregistering a tab removes its registration and activation state. If the selected tab disappears, the first remaining tab becomes selected and activated.

## Testing

Focused Vitest coverage will verify that:

- only the initial tab is activated during registration;
- selecting another tab activates it and keeps it activated afterward;
- `Tab` gates slot rendering on activation;
- both inline audio players omit volume controls and total-duration output while retaining elapsed time and seeking;
- the global bottom player remains untouched.

After focused tests pass, run the complete unit suite and Nuxt typecheck.
