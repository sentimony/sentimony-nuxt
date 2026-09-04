export interface CollectionState {
  loading: boolean
  loaded: boolean
  error: boolean
  empty: boolean
  hasMore: boolean
  remaining: number
  emptyText: string
}

// Text for the polite status region of <CollectionStatus>. The first failure is
// announced by the role="alert" branch, so this stays silent for it; a retry
// that fails again keeps the alert mounted, so the failure is announced here.
export function collectionAnnouncement(state: CollectionState, previous?: CollectionState): string {
  if (state.error) {
    if (state.loading) return 'Retrying'
    return previous?.error && previous.loading ? 'Retry failed' : ''
  }
  if (state.loading) return 'Loading'
  if (!state.loaded) return ''
  if (state.empty) return state.emptyText
  if (state.hasMore) return `Loaded, ${state.remaining} more available`
  return 'All items loaded'
}
