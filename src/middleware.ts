/** NOTE: can be removed once Bun has implemented this class
 *
 * https://github.com/oven-sh/bun/issues/1723
 * https://github.com/oven-sh/bun/issues/1723#issuecomment-1774174194
 * */

import type { MiddlewareHandler } from 'hono'
import {
  ZstdCompressionStream,
  BrotliCompressionStream,
  ZlibCompressionStream,
} from './streams'
import type { CompressOptions } from './types'
import {
  isCloudflareWorkers,
  isDenoDeploy,
  shouldCompress,
  shouldTransform,
  zlib,
} from './helpers'
import {
  ACCEPTED_ENCODINGS,
  BROTLI_LEVEL,
  THRESHOLD_SIZE,
  ZLIB_LEVEL,
  ZSTD_LEVEL,
} from './constants'

export const compress = ({
  encoding,
  encodings = [...ACCEPTED_ENCODINGS],
  options = {},
  threshold = THRESHOLD_SIZE,
  zstdLevel = ZSTD_LEVEL,
  brotliLevel = BROTLI_LEVEL,
  zlibLevel = ZLIB_LEVEL,
  filter,
}: CompressOptions = {}): MiddlewareHandler => {
  // NOTE: uses `encoding` as the only compression scheme
  if (encoding) {
    encodings = [encoding]
  }

  options = { ...options, level: zlibLevel }

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

    // skip small size content
    if (contentLength && contentLength < threshold) {
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

    // skip by filter callback result or already compressing runtimes
    if (filter != null) {
      if (!filter(c)) {
        return
      }
    } else if (isDenoDeploy || isCloudflareWorkers) {
      return
    }

    let stream

    if (encoding === 'zstd') {
      stream = new ZstdCompressionStream(zstdLevel)
    } else if (zlib) {
      stream = new ZlibCompressionStream(encoding, options)
    } else if (encoding === 'br') {
      stream = new BrotliCompressionStream(brotliLevel)
    } else {
      stream = new CompressionStream(encoding)
    }

    c.res = new Response(body.pipeThrough(stream), c.res)

    c.res.headers.delete('Content-Length')
    c.res.headers.set('Content-Encoding', encoding)
  }
}
