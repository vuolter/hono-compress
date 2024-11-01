import { ACCEPTED_ENCODINGS } from "./middleware"
import type { BrotliOptions, ZlibOptions } from "node:zlib"
import type { ZlibCompressionOptions, LibdeflateCompressionOptions } from "bun"

export type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number]
export type CompressionOptions = ZlibCompressionOptions | LibdeflateCompressionOptions
export type CompressionStreamOptions = BrotliOptions | ZlibOptions

export interface CompressOptions {
  /**
   * Algorithm to use for compression.
   *
   * @default `gzip`
   */
  type: CompressionEncoding

  /**
   * Options for the compression algorithm.
   *
   * @param {Object}
   */
  options?: CompressionOptions

  /**
   * Options for the stream compression algorithm.
   *
   * @param {Object}
   */
  streamOptions?: CompressionStreamOptions

  /**
   * The minimum byte size for a response to be compressed.
   *
   * @default 1024
   */
  threshold?: number
}
