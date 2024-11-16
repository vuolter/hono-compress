import type { Context, MiddlewareHandler } from 'hono'

import type { CompressionEncoding, CompressionFilter, CompressOptions } from './types'

import {
  ACCEPTED_ENCODINGS,
  BROTLI_LEVEL,
  THRESHOLD_SIZE,
  ZLIB_LEVEL,
  ZSTD_LEVEL,
} from './constants'
import {
  isCloudflareWorkers,
  isDenoDeploy,
  shouldCompress,
  shouldTransform,
  zlib,
} from './helpers'
import {
  BrotliCompressionStream,
  ZlibCompressionStream,
  ZstdCompressionStream,
} from './streams'

function checkResposeType(c: Context) {
  // skip no content
  if (!c.res.body) {
    throw Error
  }

  // skip head request
  if (c.req.method === 'HEAD') {
    throw Error
  }
}

function checkResponseCompressible(c: Context, threshold: number) {
  // skip already encoded
  if (c.res.headers.has('Content-Encoding')) {
    throw Error
  }

  const contentLength = Number(c.res.headers.get('Content-Length'))

  // skip small size content
  if (contentLength && contentLength < threshold) {
    throw Error
  }

  // skip un-compressible content
  if (!shouldCompress(c.res)) {
    throw Error
  }

  // skip un-transformable content
  if (!shouldTransform(c.res)) {
    throw Error
  }
}

function checkResponseFilter(c: Context, filter: CompressionFilter | null | undefined) {
  // skip by filter callback result or already compressing runtimes
  if (filter != null) {
    if (!filter(c)) {
      throw Error
    }
  } else if (isDenoDeploy || isCloudflareWorkers) {
    throw Error
  }
}

function getAcceptedEncoding(c: Context, encodings: CompressionEncoding[]) {
  const acceptedEncoding = c.req.header('Accept-Encoding')

  if (!acceptedEncoding) {
    return
  }

  return encodings.find((enc) => acceptedEncoding.includes(enc))
}

export function compress({
  encoding,
  encodings = [...ACCEPTED_ENCODINGS],
  threshold = THRESHOLD_SIZE,
  zstdLevel = ZSTD_LEVEL,
  brotliLevel = BROTLI_LEVEL,
  zlibLevel = ZLIB_LEVEL,
  options = {},
  filter,
}: CompressOptions = {}): MiddlewareHandler {
  // NOTE: uses `encoding` as the only compression scheme
  if (encoding) {
    encodings = [encoding]
  }
  options = { ...options, level: zlibLevel }

  return async function compress(c, next) {
    await next()

    // skip checks failed
    try {
      checkResposeType(c)
      checkResponseCompressible(c, threshold)
      checkResponseFilter(c, filter)
    } catch {
      return
    }

    const enc = getAcceptedEncoding(c, encodings)

    // skip no accepted encoding
    if (!enc) {
      return
    }

    let stream

    if (enc === 'zstd') {
      stream = new ZstdCompressionStream(zstdLevel)
    } else if (zlib) {
      stream = new ZlibCompressionStream(enc, options)
    } else if (enc === 'br') {
      stream = new BrotliCompressionStream(brotliLevel)
    } else {
      stream = new CompressionStream(enc)
    }

    c.res = new Response(c.res.body!.pipeThrough(stream), c.res)

    c.res.headers.delete('Content-Length')
    c.res.headers.set('Content-Encoding', enc)
  }
}
