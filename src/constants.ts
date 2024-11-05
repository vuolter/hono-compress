// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
export const CLOUDFLARE_WORKERS_NAVIGATOR = 'Cloudflare-Workers'

export const ACCEPTED_ENCODINGS = ['zstd', 'br', 'gzip', 'deflate'] as const
export const NODE_ENCODINGS = ['br', 'gzip', 'deflate'] as const

export const CACHECONTROL_NOTRANSFORM_REGEXP = /(?:^|,)\s*?no-transform\s*?(?:,|$)/i

export const THRESHOLD_SIZE = 1024
export const ZSTD_LEVEL = 2
export const BROTLI_LEVEL = 4
export const ZLIB_LEVEL = 6
