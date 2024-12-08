// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
export const CLOUDFLARE_WORKERS_NAVIGATOR = 'Cloudflare-Workers'

export const ACCEPTED_ENCODINGS = ['zstd', 'br', 'gzip', 'deflate'] as const
export const NODE_ENCODINGS = ['br', 'gzip', 'deflate'] as const

export const CACHECONTROL_NOTRANSFORM_REGEXP = /(?:^|,)\s*no-transform\s*(?:,|$)/i

export const THRESHOLD_SIZE = 1024

export const ZSTD_DEFAULT_LEVEL = 2
export const ZSTD_MIN_LEVEL = 1
export const ZSTD_MAX_LEVEL = 22

export const BROTLI_DEFAULT_LEVEL = 4
export const BROTLI_MIN_LEVEL = 1
export const BROTLI_MAX_LEVEL = 11

export const GZIP_DEFAULT_LEVEL = 6
export const GZIP_MIN_LEVEL = 0
export const GZIP_MAX_LEVEL = 9
