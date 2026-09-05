import { expect, test } from '@playwright/test'

test('uses public CDN caching only for public catalog API', async ({ request }) => {
  const publicResponse = await request.get('/api/releases')
  expect(publicResponse.status()).toBe(200)
  expect(publicResponse.headers()['netlify-cdn-cache-control']).toContain('public')

  const privateResponse = await request.get('/api/likes')
  expect(privateResponse.status()).toBe(200)
  expect(privateResponse.headers()['cache-control']).toBe('private, no-store')
  expect(privateResponse.headers()['netlify-cdn-cache-control']).toBe('private, no-store')
})

// Release and artist detail routes read without the `visible` filter on
// purpose (hidden entries stay reachable from /releases/all and /artists/all);
// the other detail routes keep hiding invisible records.
test('serves hidden release and artist details but hides the other invisible records', async ({ request }) => {
  const [release, artist] = await Promise.all([
    request.get('/api/release/va-gatekey-vol-3'),
    request.get('/api/artist/harax'),
  ])
  expect(release.status()).toBe(200)
  expect(artist.status()).toBe(200)

  const hidden = await Promise.all([
    request.get('/api/playlist/psydnb'),
    request.get('/api/video/irukanji-from-my-nerves'),
    request.get('/api/friend/clocktail'),
  ])
  for (const response of hidden) {
    expect(response.status()).toBe(404)
  }
})
