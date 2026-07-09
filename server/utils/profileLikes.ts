type ProfileLikeResult = {
  data: unknown[]
  total: number
}

type ProfileLikeLoaders = Record<string, () => Promise<ProfileLikeResult>>

export async function aggregateProfileLikes<T extends ProfileLikeLoaders>(loaders: T) {
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([key, load]) => [key, await load()] as const)
  )

  return Object.fromEntries(entries) as { [K in keyof T]: Awaited<ReturnType<T[K]>> }
}
