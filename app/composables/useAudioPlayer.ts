import type { QueueItem } from '~/utils/audioQueue'
import { nextQueueIndex, prevQueueIndex, shuffleQueueOrder } from '~/utils/audioQueue'
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
  releaseTitle?: string
  artistLink?: string
  kind: 'mix' | 'track'
  queue?: QueueItem[]
  queueIndex?: number
}

export const PLAYER_CURRENT_KEY = 'player-current'

export function useAudioPlayer() {
  const current = useState<PlayerItem | null>('audio-player-current', () => null)
  const isPlaying = useState<boolean>('audio-player-playing', () => false)
  const currentTime = useState<number>('audio-player-time', () => 0)
  const duration = useState<number>('audio-player-duration', () => 0)
  const volume = useState<number>('audio-player-volume', () => 1)
  const seekTo = useState<number | null>('audio-player-seek', () => null)
  const repeatMode = useState<'off' | 'all' | 'one'>('audio-player-repeat', () => 'off')
  // Shuffle is a playback-order layer over the queue: `shuffleOrder` holds queue
  // indices in the order they play, so each track still plays once per pass.
  // Like repeatMode, it is session state and not persisted.
  const shuffle = useState<boolean>('audio-player-shuffle', () => false)
  const shuffleOrder = useState<number[] | null>('audio-player-shuffle-order', () => null)
  // Bumped on every playback start (new track, queue move, or repeat replay) so
  // listeners can count one play per cycle.
  const playToken = useState<number>('audio-player-token', () => 0)

  function cycleRepeat() {
    repeatMode.value = repeatMode.value === 'off' ? 'all' : repeatMode.value === 'all' ? 'one' : 'off'
  }

  function reshuffle(from = current.value?.queueIndex ?? 0) {
    const length = current.value?.queue?.length ?? 0
    shuffleOrder.value = length ? shuffleQueueOrder(length, from) : null
  }

  function toggleShuffle() {
    shuffle.value = !shuffle.value
    if (shuffle.value) reshuffle()
    else shuffleOrder.value = null
  }

  function play(item: PlayerItem) {
    // A different queue invalidates the order; moveTo() keeps the same queue reference.
    if (item.queue !== current.value?.queue) shuffleOrder.value = null
    currentTime.value = 0
    duration.value = 0
    current.value = item
    isPlaying.value = true
    playToken.value++
    if (shuffle.value && !shuffleOrder.value) reshuffle(item.queueIndex ?? 0)
  }

  // Resolve the neighbouring queue index, following the shuffled order when it is active.
  function stepIndex(direction: 'next' | 'prev'): number | null {
    const item = current.value
    const length = item?.queue?.length ?? 0
    if (!length) return null
    const index = item?.queueIndex ?? 0
    const order = shuffleOrder.value
    if (!shuffle.value || !order || order.length !== length) {
      return direction === 'next' ? nextQueueIndex(length, index) : prevQueueIndex(index)
    }
    const position = order.indexOf(index)
    if (position === -1) return null
    const stepped = direction === 'next' ? nextQueueIndex(order.length, position) : prevQueueIndex(position)
    return stepped === null ? null : order[stepped] ?? null
  }

  // Loads a track into the bar without starting it and without bumping playToken,
  // so a restored or proposed track is not counted as a play.
  function restore(item: PlayerItem) {
    currentTime.value = 0
    duration.value = 0
    current.value = item
    isPlaying.value = false
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
    shuffleOrder.value = null
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
      releaseTitle: entry.releaseTitle,
      artistLink: entry.artistLink,
      queueIndex: index,
    })
  }

  function next() {
    moveTo(stepIndex('next'))
  }

  function prev() {
    moveTo(stepIndex('prev'))
  }

  function isCurrent(src: string) {
    return current.value?.src === src
  }

  return { current, isPlaying, currentTime, duration, volume, seekTo, repeatMode, shuffle, playToken, cycleRepeat, toggleShuffle, reshuffle, stepIndex, play, restore, toggle, seek, setVolume, close, next, prev, moveTo, isCurrent }
}
