import type { TitleSegment } from '~/utils/tracks'

export interface QueueItem {
  src: string
  title: string
  link?: string
  artist?: string
  artistSegments?: TitleSegment[]
  name?: string
  nameSegments?: TitleSegment[]
  cover?: string
  releaseLink?: string
  releaseTitle?: string
  artistLink?: string
}

export function nextQueueIndex(length: number, index: number): number | null {
  const next = index + 1
  return next < length ? next : null
}

export function prevQueueIndex(index: number): number | null {
  return index > 0 ? index - 1 : null
}

// Playback order for shuffle: the current track stays first, the rest are permuted,
// so every queued track still plays exactly once per pass.
export function shuffleQueueOrder(length: number, start: number, random: () => number = Math.random): number[] {
  if (length <= 0) return []
  const rest = Array.from({ length }, (_, i) => i).filter(i => i !== start)
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = rest[i]!
    rest[i] = rest[j]!
    rest[j] = a
  }
  return start >= 0 && start < length ? [start, ...rest] : rest
}
