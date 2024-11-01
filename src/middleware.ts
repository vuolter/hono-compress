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

export const compress = (
  { type, options = {}, streamOptions = {}, threshold = 1024 }: CompressOptions = {
    type: "gzip",
  },
): MiddlewareHandler => {
  if (!ACCEPTED_ENCODINGS.includes(type)) {
    throw new Error(`Invalid compression type: ${type}`)
  }

  return async function compress(c, next) {
    await next()

    let compressedBody

    const isAcceptedEncoding = c.req.header("Accept-Encoding")?.includes(type)

    if (!isAcceptedEncoding || !c.res.body) {
      return
    }

    const isReadableStream = c.res.body instanceof ReadableStream

    if (isReadableStream) {
      compressedBody = c.res.body.pipeThrough(
        new CompressionStream(type, streamOptions),
      )
    } else {
      const buffer = await c.req.arrayBuffer()

      if (buffer.byteLength < threshold) {
        return
      }
      const compress = type === "gzip" ? gzipSync : deflateSync
      compressedBody = compress(buffer, options)
    }

    c.res = new Response(compressedBody, { headers: c.res.headers })
    c.res.headers.set("Content-Encoding", type)
  }
}
