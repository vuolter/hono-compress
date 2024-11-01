/** NOTE: can be removed once Bun has implemented this class
 *
 * https://github.com/oven-sh/bun/issues/1723
 * https://github.com/oven-sh/bun/issues/1723#issuecomment-1774174194
 * */

import type { MiddlewareHandler } from "hono"
import { gzipSync, deflateSync } from "bun"
import { CompressionStream } from "./stream"
import type { CompressOptions } from "./types"

export const ACCEPTED_ENCODINGS = ["br", "gzip", "deflate"] as const

export const compress = ({
  encoding,
  encodings = [...ACCEPTED_ENCODINGS],
  options = {},
  streamOptions = {},
  threshold = 1024,
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

    let compressedBody

    const body = c.res.body

    if (!body) {
      return
    }

    const acceptedEncoding = c.req.header("Accept-Encoding")

    if (!acceptedEncoding) {
      return
    }

    const encoding = encodings.find((enc) => acceptedEncoding.includes(enc))

    if (!encoding) {
      return
    }

    const isReadableStream = body instanceof ReadableStream

    if (isReadableStream) {
      compressedBody = body.pipeThrough(new CompressionStream(encoding, streamOptions))
    } else {
      const buffer = await c.req.arrayBuffer()

      if (buffer.byteLength < threshold) {
        return
      }
      const compress = encoding === "gzip" ? gzipSync : deflateSync
      compressedBody = compress(buffer, options)
    }

    c.res = new Response(compressedBody, { headers: c.res.headers })
    c.res.headers.set("Content-Encoding", encoding)
  }
}
