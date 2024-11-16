import { describe, expect, it } from 'bun:test'
import { type Context, Hono } from 'hono'

import type { CompressionEncoding } from '../src/types'

import { compress } from '../src'

const TEXT = `
もしも願いが一つ叶うなら
世界でたった一人だけの友達を
生きることは素晴らしいこと
そんなふうに私も思ってみたい`

function handler(c: Context) {
  return c.text(TEXT, 200, { 'Content-Type': 'text/plain' })
}

function req(encoding: CompressionEncoding) {
  return new Request('http://localhost/', { headers: { 'Accept-Encoding': encoding } })
}

describe('Compression', () => {
  it('handle zstd compression', async () => {
    const app = new Hono().use(compress()).get('/', handler)

    const res = await app.request(req('zstd'))

    expect(res.headers.get('Content-Encoding')).toBe('zstd')
  })

  it('handle brotli compression', async () => {
    const app = new Hono().use(compress()).get('/', handler)

    const res = await app.request(req('br'))

    expect(res.headers.get('Content-Encoding')).toBe('br')
  })

  it('handle gzip compression', async () => {
    const app = new Hono().use(compress()).get('/', handler)

    const res = await app.request(req('gzip'))

    expect(res.headers.get('Content-Encoding')).toBe('gzip')
  })

  it('handle deflate compression', async () => {
    const app = new Hono().use(compress()).get('/', handler)

    const res = await app.request(req('deflate'))

    expect(res.headers.get('Content-Encoding')).toBe('deflate')
  })

  it('accept additional headers', async () => {
    const app = new Hono().use(compress({ encoding: 'deflate' })).get('/', (c) => {
      c.res.headers.set('x-powered-by', 'Hono')
      return handler(c)
    })

    const res = await app.request(req('deflate'))

    expect(res.headers.get('Content-Encoding')).toBe('deflate')
    expect(res.headers.get('x-powered-by')).toBe('Hono')
  })

  it('return correct plain/text', async () => {
    const app = new Hono().use(compress({ encoding: 'deflate' })).get('/', handler)

    const res = await app.request(req('deflate'))

    expect(res.headers.get('Content-Type')).toBe('text/plain')
  })

  it('return correct application/json', async () => {
    const app = new Hono()
      .use('*', compress({ encoding: 'deflate' }))
      .get('/', (c) => c.json({ hello: 'world' }))

    const res = await app.request(req('deflate'))

    expect(res.headers.get('Content-Type')).toBe('application/json; charset=UTF-8')
  })

  it('return correct application/json', async () => {
    const app = new Hono()
      .use('*', compress())
      .get('/', (c) => c.json({ hello: 'world' }))

    const res = await app.request(req('deflate'))

    expect(res.headers.get('Content-Type')).toBe('application/json; charset=UTF-8')
  })

  it('return correct image type', async () => {
    const app = new Hono().use(compress())

    app.get('/', async (c) =>
      c.body(await Bun.file('tests/mei.jpg').arrayBuffer(), 200, {
        'Content-Type': 'image/jpeg',
      }),
    )
    const res = await app.request(req('deflate'))

    expect(res.headers.get('Content-Type')).toBe('image/jpeg')
  })
})
