export type ProfileLikesPage<T = unknown> = {
  data: T[]
  total: number
}

type ProfileLikesLoaders = Record<string, () => Promise<ProfileLikesPage>>

export async function aggregateProfileLikes<T extends ProfileLikesLoaders>(
  loaders: T,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([key, load]) => [key, await load()] as const),
  )

  return Object.fromEntries(entries) as { [K in keyof T]: Awaited<ReturnType<T[K]>> }
}
