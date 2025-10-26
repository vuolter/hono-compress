import type { Context } from 'hono'
import type {
  BrotliOptions as NodeBrotliOptions,
  ZlibOptions as NodeZlibOptions,
  ZstdOptions as NodeZstdOptions,
} from 'node:zlib'

import type {
  ACCEPTED_ENCODINGS,
  BROTLI_MAX_LEVEL,
  BROTLI_MIN_LEVEL,
  BUN_ENCODINGS,
  WEB_ENCODINGS,
  ZLIB_ENCODINGS,
  ZLIB_MAX_LEVEL,
  ZLIB_MIN_LEVEL,
  ZSTD_MAX_LEVEL,
  ZSTD_MIN_LEVEL,
} from '~/constants'

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>
type Increment<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? [...Acc, number]['length']
  : Increment<N, [...Acc, number]>
type IntClosedRange<Start extends number, End extends number> = Exclude<
  Enumerate<Increment<End>>,
  Enumerate<Start>
>

interface BunZstdOptions {
  level?: ZstdLevel
}

interface BunZlibOptions {
  level?: ZlibLevel
  memLevel?: IntClosedRange<1, 9>
  windowBits?:
    | -15
    | -14
    | -13
    | -12
    | -11
    | -10
    | -9
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
  strategy?: number
  library?: 'zlib'
}

export type ZstdLevel = IntClosedRange<typeof ZSTD_MIN_LEVEL, typeof ZSTD_MAX_LEVEL>
export type BrotliLevel = IntClosedRange<
  typeof BROTLI_MIN_LEVEL,
  typeof BROTLI_MAX_LEVEL
>
export type ZlibLevel = IntClosedRange<typeof ZLIB_MIN_LEVEL, typeof ZLIB_MAX_LEVEL>

export type ZstdOptions = BunZstdOptions | NodeZstdOptions
export type BrotliOptions = NodeBrotliOptions
export type ZlibOptions = BunZlibOptions | NodeZlibOptions

export type BunCompressionEncoding = (typeof BUN_ENCODINGS)[number]
export type BunCompressionOptions<Enc> = Enc extends 'zstd'
  ? BunZstdOptions
  : BunZlibOptions

export type NodeCompressionEncoding = (typeof ZLIB_ENCODINGS)[number]
export type NodeCompressionOptions<Enc> = Enc extends 'zstd'
  ? NodeZstdOptions
  : Enc extends 'br'
    ? NodeBrotliOptions
    : NodeZlibOptions

export type WebCompressionEncoding = (typeof WEB_ENCODINGS)[number]

export type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number]
export type CompressionOptions<Enc> = Enc extends 'zstd'
  ? ZstdOptions
  : Enc extends 'br'
    ? BrotliOptions
    : ZlibOptions
export type CompressionConfig =
  | [BrotliLevel, BrotliOptions | undefined]
  | [ZlibLevel, undefined | ZlibOptions]
  | [ZstdLevel, undefined | ZstdOptions]
export type CompressionCallback = (c: Context) => boolean

export interface HonoCompressOptions {
  /**
   * Algorithm to be used to compress the response content
   */
  encoding?: CompressionEncoding

  /**
   * List of algorithms allowed to be used to compress the response content
   */
  encodings?: CompressionEncoding[]

  /**
   * Algorithm to be used as fallback to compress the response content if no accept-encoding header is provided by the client
   */
  fallback?: CompressionEncoding

  /**
   * Forces content compression even if the response content-type cannot be determined and the cache-control is set to no-transform
   */
  force?: boolean

  /**
   * Disables response content compression if request header x-no-compression has been provided by the client
   */
  strict?: boolean

  /**
   * Enables to always streaming compressed response content
   */
  stream?: boolean

  /**
   * Allows Bun compressor to be used
   */
  bun?: boolean

  /**
   * Allows Node compressor to be used
   */
  node?: boolean

  /**
   * The minimum size in bytes for a response content to be compressed
   */
  threshold?: number

  /**
   * Zstandard algorithm compression level
   */
  zstdLevel?: ZstdLevel

  /**
   * Zstandard algorithm compression options
   */
  zstdOptions?: ZstdOptions

  /**
   * Brotli algorithm compression level
   */
  brotliLevel?: BrotliLevel

  /**
   * Brotli algorithm compression options
   */
  brotliOptions?: BrotliOptions

  /**
   * Gzip algorithm compression level
   */
  gzipLevel?: ZlibLevel

  /**
   * Gzip algorithm compression options
   */
  gzipOptions?: ZlibOptions

  /**
   * Deflate algorithm compression level
   */
  deflateLevel?: ZlibLevel

  /**
   * Deflate algorithm compression options
   */
  deflateOptions?: ZlibOptions

  /**
   * Custom override filtering function
   */
  filter?: CompressionCallback
}

export interface CompressRules {
  force?: boolean
  strict?: boolean
  stream?: boolean
  bun?: boolean
  node?: boolean
  threshold?: number
  filter?: CompressionCallback
}
