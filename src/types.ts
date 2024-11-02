import { NODE_ENCODINGS, WEB_ENCODINGS, ZSTD_ENCODINGS } from './constants'
import type { BrotliOptions, ZlibOptions } from 'node:zlib'

export type ZstdCompressionEncoding = (typeof ZSTD_ENCODINGS)[number]

export type NodeCompressionEncoding = (typeof NODE_ENCODINGS)[number]
export type NodeCompressionOptions = BrotliOptions | ZlibOptions

export type WebCompressionEncoding = (typeof WEB_ENCODINGS)[number]

export type CompressionEncoding =
  | ZstdCompressionEncoding
  | NodeCompressionEncoding
  | WebCompressionEncoding

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
   * Options passed to the node compression engine.
   *
   * @param {Object}
   */
  options?: NodeCompressionOptions

  /**
   * The minimum size in bytes for a response content to be compressed.
   *
   * @default 1024
   */
  threshold?: number

  /**
   * Zstandard algorithm compression level
   *
   * @default 3
   */
  zstdLevel?: number
}
