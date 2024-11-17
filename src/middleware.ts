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

function checkCompressEncodings(encodings: CompressionEncoding[]) {
  const unsupportedEncoding: string | undefined = encodings.find(
    (enc) => !ACCEPTED_ENCODINGS.includes(enc),
  )
  if (unsupportedEncoding) {
    throw new Error(`Invalid compression encoding: ${unsupportedEncoding}`)
  }
}

function checkResposeType(c: Context) {
  // NOTE: skip no content
  if (!c.res.body) {
    throw Error
  }

  // NOTE: skip head request
  if (c.req.method === 'HEAD') {
    throw Error
  }
}

function checkResponseCompressible(c: Context, threshold: number) {
  // NOTE: skip no-compression request
  if (c.req.header('x-no-compression')) {
    throw Error
  }
  // NOTE: skip already encoded
  if (c.res.headers.has('Content-Encoding')) {
    throw Error
  }

  const contentLength = Number(c.res.headers.get('Content-Length'))

  // NOTE: skip small size content
  if (contentLength && contentLength < threshold) {
    throw Error
  }

  // NOTE: skip un-compressible content
  if (!shouldCompress(c.res)) {
    throw Error
  }

  // NOTE: skip un-transformable content
  if (!shouldTransform(c.res)) {
    throw Error
  }
}

function checkResponseFilter(c: Context, filter: CompressionFilter | null | undefined) {
  // NOTE: skip by callback result or if an already compressing runtime
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
  // NOTE: use `encoding` as the only compression scheme
  if (encoding) {
    encodings = [encoding]
  }
  options = { ...options, level: zlibLevel }

  // NOTE: fail if unsupported encodings
  checkCompressEncodings(encodings)

  return async function compress(c, next) {
    await next()

    // NOTE: skip if checks failed
    try {
      checkResposeType(c)
      checkResponseCompressible(c, threshold)
      checkResponseFilter(c, filter)
    } catch {
      return
    }

    const enc = getAcceptedEncoding(c, encodings)

    // NOTE: skip if no accepted encoding
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
