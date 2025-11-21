import {
  CACHECONTROL_NOTRANSFORM_REGEX,
  CLOUDFLARE_WORKERS_NAVIGATOR,
  COMPRESSIBLE_CONTENT_TYPE_REGEX,
  TRANSFERENCODING_NOCOMPRESS_REGEX,
} from '~/constants'
import { bun } from '~/imports'

export const isBunRuntime = bun != undefined

export const isCloudflareWorkers =
  globalThis.navigator?.userAgent === CLOUDFLARE_WORKERS_NAVIGATOR

export const isDenoDeploy =
  (
    globalThis as typeof globalThis & {
      Deno?: { env: { get: (key: string) => string | undefined } }
    }
  ).Deno?.env?.get('DENO_DEPLOYMENT_ID') !== undefined

export function isContentCompressible(res: Response) {
  const contentType = res.headers.get('Content-Type')
  return !!contentType && COMPRESSIBLE_CONTENT_TYPE_REGEX.test(contentType)
}

export function isContentTransformable(res: Response) {
  const cacheControl = res.headers.get('Cache-Control')
  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl || !CACHECONTROL_NOTRANSFORM_REGEX.test(cacheControl)
}

export function isContentEncodable(res: Response) {
  const contentEncoding = res.headers.get('Content-Encoding')
  const transferEncoding = res.headers.get('Transfer-Encoding')
  return (
    !contentEncoding &&
    (!transferEncoding || !TRANSFERENCODING_NOCOMPRESS_REGEX.test(transferEncoding))
  )
}

export function hasContent(res: Response, threshold?: number): boolean {
  const contentLength = res.headers.get('Content-Length')
  if (!res.body) {
    return false
  }
  if (!contentLength || !threshold) {
    return true
  }
  return Number(contentLength) >= threshold
}

export function isStreaming(res: Response) {
  const transferEncoding = res.headers.get('Transfer-Encoding')
  return transferEncoding?.includes('chunked')
}
