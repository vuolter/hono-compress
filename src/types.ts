import type { Context } from 'hono'
import type { BrotliOptions, ZlibOptions } from 'node:zlib'

import type { ACCEPTED_ENCODINGS, NODE_ENCODINGS } from './constants'

export type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number]

export type NodeCompressionEncoding = (typeof NODE_ENCODINGS)[number]
export type NodeCompressionOptions = BrotliOptions | ZlibOptions


export interface CompressOptions {
  /**
   * Algorithm to use to compress the response content
   */
  encoding?: CompressionEncoding

  /**
   * List of algorithms allowed to be used to compress the response content
   */
  encodings?: CompressionEncoding[]

  /**
   * The minimum size in bytes for a response content to be compressed
   */
  threshold?: number

  /**
   * Zstandard algorithm compression level
   */
  zstdLevel?: number

  /**
   * Brotli algorithm compression level
   */
  brotliLevel?: number

  /**
   * Zlib algorithms compression level
   */
  zlibLevel?: number

  /**
   * Options passed to the node zlib compression engine
   */
  options?: NodeCompressionOptions

  /**
   * Custom filter function
   */
  filter?: (c: Context) => boolean
}
