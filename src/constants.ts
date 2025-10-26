// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
export const CLOUDFLARE_WORKERS_NAVIGATOR = 'Cloudflare-Workers'
export { COMPRESSIBLE_CONTENT_TYPE_REGEX } from 'hono/utils/compress'

export const ACCEPTED_ENCODINGS = ['zstd', 'br', 'gzip', 'deflate'] as const
export const BUN_ENCODINGS = ['zstd', 'gzip', 'deflate'] as const
export const ZLIB_ENCODINGS = ['zstd', 'br', 'gzip', 'deflate', 'deflate-raw'] as const
export const WEB_ENCODINGS = ['gzip', 'deflate', 'deflate-raw'] as const

export const CACHECONTROL_NOTRANSFORM_REGEX = /(?:^|,)\s*no-transform\s*(?:,|$)/i
export const TRANSFERENCODING_NOCOMPRESS_REGEX =
  /(?:^|,)\s*(compress|gzip|deflate)\s*(?:,|$)/i

export const THRESHOLD_SIZE = 1024

export const ZSTD_DEFAULT_LEVEL = 2
export const ZSTD_MIN_LEVEL = 1
export const ZSTD_MAX_LEVEL = 22

export const BROTLI_DEFAULT_LEVEL = 4
export const BROTLI_MIN_LEVEL = 0
export const BROTLI_MAX_LEVEL = 11

export const ZLIB_DEFAULT_LEVEL = 6
export const ZLIB_MIN_LEVEL = 0
export const ZLIB_MAX_LEVEL = 9
