import { describe, it, expect } from 'bun:test'

import type { CompressionEncoding } from '../src/types'
import { compress } from '../src'
import { Hono, type Context } from 'hono'

const req = (encoding: CompressionEncoding) =>
  new Request('http://localhost/', { headers: { 'Accept-Encoding': encoding } })

const text = `
もしも願いが一つ叶うなら
世界でたった一人だけの友達を
生きることは素晴らしいこと
そんなふうに私も思ってみたい`

const handler = (c: Context) => c.text(text, 200, { 'Content-Type': 'text/plain' })

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
