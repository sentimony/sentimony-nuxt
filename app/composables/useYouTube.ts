import { computed, unref, type Ref } from 'vue'

// Single video from short link (basic transform)
export function useYouTube(
  youtube: string | null | undefined | Ref<string | null | undefined>
) {
  const embed = computed(() => {
    const link = (unref(youtube) || '').trim()
    if (!link) return ''
    const id = link.replace('https://youtu.be/', '')
    return `https://www.youtube.com/embed/${id}`
  })
  return { embed }
}

function extractListId(input: string): string {
  if (!input) return ''
  try {
    // If input is a full URL, parse query param
    if (/^https?:\/\//i.test(input)) {
      const url = new URL(input)
      const list = url.searchParams.get('list') || ''
      return list
    }
    // Fallback: try to capture list=... from raw string
    const m = input.match(/list=([^&]+)/)
    const id = m?.[1]
    if (id) return id
    // Assume input is already a list id
    return input
  } catch {
    return ''
  }
}

// YouTube playlist → embed/videoseries?list=
export function useYouTubePlaylist(
  playlistUrlOrId: string | null | undefined | Ref<string | null | undefined>
) {
  const embed = computed(() => {
    const raw = (unref(playlistUrlOrId) || '').trim()
    if (!raw) return ''
    const listId = extractListId(raw)
    if (!listId) return ''
    return `https://www.youtube.com/embed/videoseries?list=${listId}`
  })
  return { embed }
}

// YouTube Music playlist → embed/videoseries?list=
export function useYouTubeMusicPlaylist(
  playlistUrlOrId: string | null | undefined | Ref<string | null | undefined>
) {
  const embed = computed(() => {
    const raw = (unref(playlistUrlOrId) || '').trim()
    if (!raw) return ''
    const listId = extractListId(raw)
    if (!listId) return ''
    return `https://www.youtube.com/embed/videoseries?list=${listId}`
  })
  return { embed }
}
