import type { Context } from 'hono'
import type { BrotliOptions, ZlibOptions } from 'node:zlib'
import type { IntClosedRange } from 'type-fest'

import type {
  ACCEPTED_ENCODINGS,
  BROTLI_MAX_LEVEL,
  BROTLI_MIN_LEVEL,
  GZIP_MAX_LEVEL,
  GZIP_MIN_LEVEL,
  NODE_ENCODINGS,
  ZSTD_MAX_LEVEL,
  ZSTD_MIN_LEVEL,
} from '~/constants'

export type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number]

export type NodeCompressionEncoding = (typeof NODE_ENCODINGS)[number]
export type NodeCompressionOptions = BrotliOptions | ZlibOptions

export type CompressionFilter = (c: Context) => boolean

export type ZstdLevel = IntClosedRange<typeof ZSTD_MIN_LEVEL, typeof ZSTD_MAX_LEVEL>
export type BrotliLevel = IntClosedRange<
  typeof BROTLI_MIN_LEVEL,
  typeof BROTLI_MAX_LEVEL
>
export type GzipLevel = IntClosedRange<typeof GZIP_MIN_LEVEL, typeof GZIP_MAX_LEVEL>

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
   * Forces content compression even if the request accept-encoding and the response content-type cannot be determined
   */
  force?: boolean

  /**
   * The minimum size in bytes for a response content to be compressed
   */
  threshold?: number

  /**
   * Zstandard algorithm compression level
   */
  zstdLevel?: ZstdLevel

  /**
   * Brotli algorithm compression level
   */
  brotliLevel?: BrotliLevel

  /**
   * Gzip algorithms compression level
   */
  gzipLevel?: GzipLevel

  /**
   * Options passed to the node zlib compression engine
   */
  options?: NodeCompressionOptions

  /**
   * Custom filter function
   */
  filter?: CompressionFilter
}
