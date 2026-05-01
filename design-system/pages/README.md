# Page Overrides

Place page-specific deviations from `../MASTER.md` here, one file per route.

**Naming:** kebab-case matching the route segment.

| Route | File |
|-------|------|
| `/` | `home.md` |
| `/releases` | `releases.md` |
| `/release/[id]` | `release-detail.md` |
| `/artists` | `artists.md` |
| `/artist/[id]` | `artist-detail.md` |
| `/videos` | `videos.md` |
| `/video/[id]` | `video-detail.md` |
| `/playlists` | `playlists.md` |
| `/playlist/[id]` | `playlist-detail.md` |
| `/events` | `events.md` |
| `/event/[id]` | `event-detail.md` |
| `/tracks` | `tracks.md` |
| `/news` | `news.md` |
| `/friends` | `friends.md` |
| `/friend/[id]` | `friend-detail.md` |
| `/contacts` | `contacts.md` |
| `/login` | `login.md` |

## Template

```markdown
# Page Override: <Page Name>

> Inherits from `../MASTER.md`. Only document **deviations and additions**.

## Pattern
<only if different from Master>

## Layout
- Sections in order
- Container width
- Special spacing

## Components
- Which existing components are reused (Item, Swiper, BtnPrimary, …)
- Any new component required for this page only

## Tokens (overrides)
- Any colour / typography / motion token that diverges from Master and why

## Interactions specific to this page
- e.g. like button, audio play, filter behaviour

## Accessibility notes specific to this page
- e.g. live region for player state, focus management on modal open

## Anti-patterns specific to this page
```

## Retrieval rule for AI agents

When building page X:
1. Read `../MASTER.md` first.
2. If `<page-name>.md` exists in this folder — its rules override Master for that page.
3. If not — Master is the only source.
