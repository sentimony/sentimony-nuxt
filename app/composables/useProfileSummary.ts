import type { ProfileSummary } from '~/utils/profileSections'

export function useProfileSummary() {
  return useFetch<ProfileSummary>('/api/profile/summary', {
    key: 'profile-summary',
  })
}
