import type { Context, MiddlewareHandler } from 'hono'

import type {
  BunCompressionEncoding,
  BunCompressionOptions,
  CompressionCallback,
  CompressionConfig,
  CompressionEncoding,
  CompressionOptions,
  CompressRules,
  HonoCompressOptions,
  NodeCompressionEncoding,
  NodeCompressionOptions,
  WebCompressionEncoding,
} from '~/types'

import {
  ACCEPTED_ENCODINGS,
  BROTLI_DEFAULT_LEVEL,
  THRESHOLD_SIZE,
  ZLIB_DEFAULT_LEVEL,
  ZSTD_DEFAULT_LEVEL,
} from '~/constants'
import {
  hasContent,
  isCloudflareWorkers,
  isContentCompressible,
  isContentEncodable,
  isContentTransformable,
  isDenoDeploy,
  isStreaming,
} from '~/helpers'
import {
  BunCompressionStream,
  NodeCompressionStream,
  WebCompressionStream,
} from '~/streams'

import { CheckFail } from './exceptions'

function checkEncodings(encodings: CompressionEncoding[]) {
  const unsupportedEncoding: string | undefined = encodings.find(
    (enc) => !ACCEPTED_ENCODINGS.includes(enc),
  )
  if (unsupportedEncoding) {
    throw new TypeError(`Invalid compression encoding: ${unsupportedEncoding}`)
  }
}

function checkRuntime() {
  // NOTE: skip runtime already compressing by default
  if (isDenoDeploy || isCloudflareWorkers) {
    throw CheckFail
  }
}

function checkResponse(ctx: Context, { threshold, force, strict }: CompressRules) {
  // NOTE: skip head request
  if (ctx.req.method === 'HEAD') {
    throw CheckFail
  }

  // NOTE: skip no-compression request
  if (strict && ctx.req.header('x-no-compression')) {
    throw CheckFail
  }

  // NOTE: skip no content or too small
  if (!hasContent(ctx.res, threshold)) {
    throw CheckFail
  }

  // NOTE: skip already encoded content
  if (!isContentEncodable(ctx.res)) {
    throw CheckFail
  }

  if (!force) {
    // NOTE: skip un-compressible content
    if (!isContentCompressible(ctx.res)) {
      throw CheckFail
    }

    // NOTE: skip un-transformable content
    if (!isContentTransformable(ctx.res)) {
      throw CheckFail
    }
  }
}

function checkCustomFilter(ctx: Context, cb: CompressionCallback) {
  if (!cb(ctx)) {
    throw CheckFail
  }
}

function filterAcceptedEncoding(
  ctx: Context,
  encodings: CompressionEncoding[],
  fallback?: CompressionEncoding,
) {
  const acceptedEncoding = ctx.req.header('Accept-Encoding')

  if (!acceptedEncoding) {
    return fallback ? [fallback] : []
  }
  return encodings.filter((enc) => acceptedEncoding.includes(enc))
}

function getCompressionStream(
  encoding: CompressionEncoding,
  options: CompressionOptions<typeof encoding>,
  { bun, node }: CompressRules,
) {
  let stream

  try {
    if (bun !== false && BunCompressionStream.canHandle(encoding)) {
      stream = new BunCompressionStream(
        encoding as BunCompressionEncoding,
        options as BunCompressionOptions<typeof encoding>,
      )
    } else if (node !== false && NodeCompressionStream.canHandle(encoding)) {
      stream = new NodeCompressionStream(
        encoding as NodeCompressionEncoding,
        options as NodeCompressionOptions<typeof encoding>,
      )
    } else if (WebCompressionStream.canHandle(encoding)) {
      stream = new WebCompressionStream(encoding as WebCompressionEncoding)
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn(error.message)
    } else {
      throw error
    }
  }

  return stream
}

function canCompress(ctx: Context, { filter, ...options }: CompressRules) {
  try {
    if (filter) {
      checkCustomFilter(ctx, filter)
    } else {
      checkRuntime()
      checkResponse(ctx, options)
    }
  } catch (error) {
    if (error == CheckFail) {
      return false
    } else {
      throw error
    }
  }

  return true
}

async function handleCompress(
  ctx: Context,
  encodings: CompressionEncoding[],
  config: Map<string, CompressionConfig>,
  { streaming, ...rules }: CompressRules,
) {
  for (const enc of encodings) {
    const [level, options] = config.get(enc) ?? []
    const cs = getCompressionStream(enc, { level, ...options }, rules)

    if (!cs) {
      continue
    }
    if (streaming === undefined) {
      streaming = isStreaming(ctx.res)
    }

    const body = ctx.res.body!.pipeThrough(cs)

    if (streaming) {
      ctx.res = new Response(body, ctx.res)
      ctx.res.headers.delete('Content-Length')
    } else {
      const buffer = await new Response(body).arrayBuffer()
      ctx.res = new Response(buffer, ctx.res)
      ctx.res.headers.set('Content-Length', buffer.byteLength.toString())
    }
    ctx.res.headers.set('Content-Encoding', enc)
    break
  }
}

export function compress({
  encoding,
  encodings = [...ACCEPTED_ENCODINGS],
  fallback,
  force = false,
  strict = true,
  streaming = true,
  bun = true,
  node = true,
  threshold = THRESHOLD_SIZE,
  zstdLevel = ZSTD_DEFAULT_LEVEL,
  brotliLevel = BROTLI_DEFAULT_LEVEL,
  gzipLevel = ZLIB_DEFAULT_LEVEL,
  deflateLevel = ZLIB_DEFAULT_LEVEL,
  zstdOptions,
  brotliOptions,
  gzipOptions,
  deflateOptions,
  filter,
}: HonoCompressOptions = {}): MiddlewareHandler {
  if (encoding) {
    encodings = [encoding]
  }

  checkEncodings(encodings)

  const rules = { filter, threshold, force, strict, streaming, bun, node }
  const config: Map<string, CompressionConfig> = new Map([
    ['br', [brotliLevel, brotliOptions]],
    ['deflate', [deflateLevel, deflateOptions]],
    ['gzip', [gzipLevel, gzipOptions]],
    ['zstd', [zstdLevel, zstdOptions]],
  ])

  return async function compress(ctx, next) {
    await next()

    if (canCompress(ctx, rules)) {
      const ae = filterAcceptedEncoding(ctx, encodings, fallback)
      if (ae.length > 0) {
        await handleCompress(ctx, ae, config, rules)
      }
    }
  }
}
