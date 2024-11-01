import { ACCEPTED_ENCODINGS } from "./middleware"
import type { BrotliOptions, ZlibOptions } from "node:zlib"
import type { ZlibCompressionOptions, LibdeflateCompressionOptions } from "bun"

export type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number]
export type CompressionOptions = ZlibCompressionOptions | LibdeflateCompressionOptions
export type CompressionStreamOptions = BrotliOptions | ZlibOptions

export interface CompressOptions {
  /**
   * Algorithm to use to compress the response content.
   *
   * @default `undefined`
   */
  encoding?: CompressionEncoding

  /**
   * List of algorithms allowed to be used to compress the response content.
   *
   * @default {ACCEPTED_ENCODINGS}
   */
  encodings?: CompressionEncoding[]

  /**
   * Options passed to the compression engine to compress fixed-length content.
   *
   * @param {Object}
   */
  options?: CompressionOptions

  /**
   * Options passed to the compression engine to compress streaming content.
   *
   * @param {Object}
   */
  streamOptions?: CompressionStreamOptions

  /**
   * The minimum size in bytes for a response content to be compressed.
   *
   * @default 1024
   */
  threshold?: number
}
