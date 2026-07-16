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
  artistLink?: string
}

export function nextQueueIndex(length: number, index: number): number | null {
  const next = index + 1
  return next < length ? next : null
}

export function prevQueueIndex(index: number): number | null {
  return index > 0 ? index - 1 : null
}
