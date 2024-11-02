/** NOTE: can be removed once Bun has implemented this class
 *
 * https://github.com/oven-sh/bun/issues/1723
 * https://github.com/oven-sh/bun/issues/1723#issuecomment-1774174194
 * */

import type { MiddlewareHandler } from 'hono'
import { NodeCompressionStream } from './node-stream'
import type { CompressOptions, WebCompressionEncoding } from './types'

import { compress as ZstdCompress } from '@mongodb-js/zstd'
import {
  isBun,
  isCloudflare,
  isDeno,
  readContentLength,
  shouldCompress,
  shouldTransform,
} from './helpers'
import { ACCEPTED_ENCODINGS, WEB_ENCODINGS } from './constants'

export const compress = ({
  encoding,
  encodings = [...ACCEPTED_ENCODINGS],
  options = {},
  threshold = 1024,
  zstdLevel = 3,
}: CompressOptions = {}): MiddlewareHandler => {
  // NOTE: If defined, uses `encoding` as the only compression scheme as does `hono/compress`
  if (encoding) {
    encodings = [encoding]
  }

  const unsupportedEncoding: string | undefined = encodings.find(
    (enc) => !ACCEPTED_ENCODINGS.includes(enc),
  )

  if (unsupportedEncoding) {
    throw new Error(`Invalid compression encoding: ${unsupportedEncoding}`)
  }

  return async function compress(c, next) {
    await next()

    let body = c.res.body

    // skip no content
    if (!body) {
      return
    }

    // skip head request
    if (c.req.method === 'HEAD') {
      return
    }

    // skip already encoded
    if (c.res.headers.has('Content-Encoding')) {
      return
    }

    // skip already compressing runtimes
    if (isDeno || isCloudflare) {
      return
    }

    // skip un-compressible content
    if (!shouldCompress(c.res)) {
      return
    }

    // skip un-transformable content
    if (!shouldTransform(c.res)) {
      return
    }

    const acceptedEncoding = c.req.header('Accept-Encoding')

    // skip no accepted encoding
    if (!acceptedEncoding) {
      return
    }

    const encoding = encodings.find((enc) => acceptedEncoding.includes(enc))

    // skip unsupported encoding
    if (!encoding) {
      return
    }

    let contentLength = Number(c.res.headers.get('Content-Length'))

    // calculate unknow content length
    if (!contentLength) {
      const { stream, length } = await readContentLength(body, threshold)

      body = stream
      contentLength = length
    }

    // skip small size content
    if (contentLength < threshold) {
      return
    }

    let compressedBody

    if (encoding === 'zstd') {
      // TODO: handle as stream
      const buffer = Buffer.from(await c.req.arrayBuffer())
      compressedBody = await ZstdCompress(buffer, zstdLevel)
    } else {
      let stream

      if (!isBun && WEB_ENCODINGS.includes(encoding as any)) {
        stream = new CompressionStream(encoding as WebCompressionEncoding)
      } else {
        stream = new NodeCompressionStream(encoding, options)
      }

      compressedBody = body.pipeThrough(stream)
    }

    c.res = new Response(compressedBody, c.res)

    c.res.headers.delete('Content-Length')
    c.res.headers.set('Content-Encoding', encoding)
  }
}
