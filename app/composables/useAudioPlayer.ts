import type { QueueItem } from '~/utils/audioQueue'
import { nextQueueIndex, prevQueueIndex } from '~/utils/audioQueue'
import type { TitleSegment } from '~/utils/tracks'

export interface PlayerItem {
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
  kind: 'mix' | 'track'
  queue?: QueueItem[]
  queueIndex?: number
}

export function useAudioPlayer() {
  const current = useState<PlayerItem | null>('audio-player-current', () => null)
  const isPlaying = useState<boolean>('audio-player-playing', () => false)
  const currentTime = useState<number>('audio-player-time', () => 0)
  const duration = useState<number>('audio-player-duration', () => 0)
  const volume = useState<number>('audio-player-volume', () => 1)
  const seekTo = useState<number | null>('audio-player-seek', () => null)

  function play(item: PlayerItem) {
    currentTime.value = 0
    duration.value = 0
    current.value = item
    isPlaying.value = true
  }

  function toggle() {
    if (!current.value) return
    isPlaying.value = !isPlaying.value
  }

  function seek(seconds: number) {
    seekTo.value = seconds
    currentTime.value = seconds
  }

  function setVolume(v: number) {
    volume.value = Math.min(1, Math.max(0, v))
  }

  function close() {
    isPlaying.value = false
    current.value = null
    currentTime.value = 0
    duration.value = 0
  }

  function moveTo(index: number | null) {
    const item = current.value
    if (index === null || !item?.queue) return
    const entry = item.queue[index]
    if (!entry) return
    play({
      ...item,
      src: entry.src,
      title: entry.title,
      link: entry.link,
      artist: entry.artist,
      artistSegments: entry.artistSegments,
      name: entry.name,
      nameSegments: entry.nameSegments,
      cover: entry.cover,
      releaseLink: entry.releaseLink,
      artistLink: entry.artistLink,
      queueIndex: index,
    })
  }

  function next() {
    const item = current.value
    if (!item?.queue) return
    moveTo(nextQueueIndex(item.queue.length, item.queueIndex ?? 0))
  }

  function prev() {
    const item = current.value
    if (!item?.queue) return
    moveTo(prevQueueIndex(item.queueIndex ?? 0))
  }

  function isCurrent(src: string) {
    return current.value?.src === src
  }

  return { current, isPlaying, currentTime, duration, volume, seekTo, play, toggle, seek, setVolume, close, next, prev, isCurrent }
}
