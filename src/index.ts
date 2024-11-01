import type { MiddlewareHandler } from "hono"
import { gzipSync, deflateSync, type ZlibCompressionOptions } from "bun"
import { CompressionStream } from "./stream"
import { isReadableStream } from "./utils"

export type CompressionOptions = {
  /**
   * @default `gzip`
   *
   * Algorithm to use for compression.
   */
  type: "gzip" | "deflate" // | 'brotli'
  /**
   * @param {Object}
   *
   * Options for the compression algorithm.
   */
  options?: ZlibCompressionOptions // | BrotliOptions
  /**
   * @default `utf-8`
   *
   * Encoding for the response body.
   */
  encoding?: BufferEncoding
}

const toBuffer = (data: unknown, encoding: BufferEncoding) =>
  Buffer.from(
    typeof data === "object"
      ? JSON.stringify(data)
      : (data?.toString() ?? new String(data)),
    encoding,
  )

export const compress = (
  { type = "gzip", options = {}, encoding = "utf-8" }: CompressionOptions = {
    type: "gzip",
    encoding: "utf-8",
  },
): MiddlewareHandler => {
  if (!["gzip", "deflate"].includes(type)) {
    throw new Error("Invalid compression type. Use gzip or deflate.")
  }

  return async function compress(c, next) {
    await next()
    const accepted = c.req.header("Accept-Encoding")
    const acceptsEncoding = accepted?.includes(type)

    if (!acceptsEncoding || !c.res.body) {
      return
    }

    const stream = c.res.body
    const compressedBody = isReadableStream(stream)
      ? stream.pipeThrough(new CompressionStream(type))
      : type === "gzip"
        ? gzipSync(toBuffer(c.res.body, encoding), options)
        : deflateSync(toBuffer(c.res.body, encoding), options)

    c.res = new Response(compressedBody, {
      headers: c.res.headers,
    })
    c.res.headers.set("Content-Encoding", type)
  }
}
