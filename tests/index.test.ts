import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

import type { CompressionEncoding } from '~/types'

import { ACCEPTED_ENCODINGS } from '~/constants'
import { compress } from '~/middleware'

const BASE_URL = 'http://localhost:8787'

function createRequestFor(encoding: CompressionEncoding, url: string = '/') {
  return new Request(new URL(url, BASE_URL).toString(), {
    headers: { 'Accept-Encoding': encoding },
  })
}

describe.concurrent.each([...ACCEPTED_ENCODINGS])('%s', (enc) => {
  test('text compression', async () => {
    const app = new Hono()
      .use(compress({ threshold: 0 }))
      .get('/', (ctx) =>
        ctx.text('こんにちは、ホノ', 200, { 'Content-Type': 'text/plain' }),
      )
    const res = await app.request(createRequestFor(enc))

    expect(res.headers.get('Content-Encoding')).toBe(enc)
    expect(res.headers.get('Content-Type')).toContain('text/plain')
  })

  test('json compression', async () => {
    const app = new Hono()
      .use(compress({ threshold: 0 }))
      .get('/', (ctx) => ctx.json({ hello: 'hono' }))
    const res = await app.request(createRequestFor(enc))

    expect(res.headers.get('Content-Encoding')).toBe(enc)
    expect(res.headers.get('Content-Type')).toContain('application/json')
  })

  test('html compression', async () => {
    const app = new Hono()
      .use(compress({ threshold: 0 }))
      .get('/', (ctx) => ctx.html('<h1>Hello Hono</h1>'))
    const res = await app.request(createRequestFor(enc))

    expect(res.headers.get('Content-Encoding')).toBe(enc)
    expect(res.headers.get('Content-Type')).toContain('text/html')
  })

  test('skipped image compression', async () => {
    const app = new Hono()
      .use(compress())
      .get('/', serveStatic({ path: './tests/mei.jpg' }))
    const res = await app.request(createRequestFor(enc))

    expect(res.headers.get('Content-Encoding')).toBe(null)
    expect(res.headers.get('Content-Type')).toContain('image/jpeg')
  })

  test('forced image compression', async () => {
    const app = new Hono()
      .use(compress({ force: true }))
      .get('/', serveStatic({ path: './tests/mei.jpg' }))
    const res = await app.request(createRequestFor(enc))

    expect(res.headers.get('Content-Encoding')).toBe(enc)
    expect(res.headers.get('Content-Type')).toContain('image/jpeg')
  })

  test('forced image compression (without streaming)', async () => {
    const app = new Hono()
      .use(compress({ force: true, streaming: false }))
      .get('/', serveStatic({ path: './tests/mei.jpg' }))
    const res = await app.request(createRequestFor(enc))

    expect(res.headers.get('Content-Encoding')).toBe(enc)
    expect(res.headers.get('Content-Type')).toContain('image/jpeg')
  })
})

test.concurrent('keep extra headers', async () => {
  const app = new Hono().use(compress({ encoding: 'deflate' })).get('/', (ctx) => {
    ctx.res.headers.set('x-powered-by', 'Hono')
    return ctx.text('ホノ')
  })
  const res = await app.request(createRequestFor('deflate'))

  expect(res.headers.get('x-powered-by')).toBe('Hono')
})
