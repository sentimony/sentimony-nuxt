export function useCanonical(getUrl: () => string | undefined) {
  useHead({
    link: [{ rel: 'canonical', href: getUrl }],
  })
}
