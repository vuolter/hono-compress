// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
export const CLOUDFLARE_WORKERS_NAVIGATOR = 'Cloudflare-Workers'

export const ZSTD_ENCODINGS = ['zstd'] as const
export const NODE_ENCODINGS = ['br', 'gzip', 'deflate'] as const
export const WEB_ENCODINGS = ['gzip', 'deflate'] as const

export const ACCEPTED_ENCODINGS = ['zstd', 'br', 'gzip', 'deflate'] as const

export const CACHECONTROL_NOTRANSFORM_REGEXP = /(?:^|,)\s*?no-transform\s*?(?:,|$)/i
