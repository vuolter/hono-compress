import type { Context, MiddlewareHandler } from 'hono'

import type { CompressionEncoding, CompressionFilter, CompressOptions } from '~/types'

import {
  ACCEPTED_ENCODINGS,
  BROTLI_DEFAULT_LEVEL,
  GZIP_DEFAULT_LEVEL,
  THRESHOLD_SIZE,
  ZSTD_DEFAULT_LEVEL,
} from '~/constants'
import {
  isCloudflareWorkers,
  isDenoDeploy,
  shouldCompress,
  shouldTransform,
} from '~/helpers'
import { zlib } from '~/imports'
import {
  BrotliCompressionStream,
  ZlibCompressionStream,
  ZstdCompressionStream,
} from '~/streams'

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

function checkResponseCompressible(c: Context, threshold: number, force: boolean) {
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
  if (!shouldCompress(c.res, force)) {
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

function findAcceptedEncoding(c: Context, encodings: CompressionEncoding[]) {
  const acceptedEncoding = c.req.header('Accept-Encoding')

  if (!acceptedEncoding) {
    return
  }
  return encodings.find((enc) => acceptedEncoding.includes(enc))
}

export function compress({
  encoding,
  encodings = [...ACCEPTED_ENCODINGS],
  force = false,
  threshold = THRESHOLD_SIZE,
  zstdLevel = ZSTD_DEFAULT_LEVEL,
  brotliLevel = BROTLI_DEFAULT_LEVEL,
  gzipLevel = GZIP_DEFAULT_LEVEL,
  options = {},
  filter,
}: CompressOptions = {}): MiddlewareHandler {
  // NOTE: use `encoding` as the only compression scheme
  if (encoding) {
    encodings = [encoding]
  }

  // NOTE: fail if unsupported encodings
  checkCompressEncodings(encodings)

  return async function compress(c, next) {
    await next()

    // NOTE: skip if checks failed
    try {
      checkResposeType(c)
      checkResponseCompressible(c, threshold, force)
      checkResponseFilter(c, filter)
    } catch {
      return
    }

    const enc = findAcceptedEncoding(c, encodings) ?? (force && encodings[0])

    // NOTE: skip if no accepted encoding
    if (!enc) {
      return
    }

    let stream

    if (enc === 'zstd') {
      stream = new ZstdCompressionStream(zstdLevel)
    } else if (zlib) {
      const level = enc === 'br' ? brotliLevel : gzipLevel
      stream = new ZlibCompressionStream(enc, { level, ...options })
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
