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

test('does not expose hidden Firebase detail records', async ({ request }) => {
  const responses = await Promise.all([
    request.get('/api/release/va-gatekey-vol-3'),
    request.get('/api/artist/harax'),
    request.get('/api/playlist/psydnb'),
    request.get('/api/video/irukanji-from-my-nerves'),
    request.get('/api/friend/clocktail'),
  ])

  for (const response of responses) {
    expect(response.status()).toBe(404)
  }
})
