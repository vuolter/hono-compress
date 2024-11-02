import { COMPRESSIBLE_CONTENT_TYPE_REGEX } from 'hono/utils/compress'
import {
  CACHECONTROL_NOTRANSFORM_REGEXP,
  CLOUDFLARE_WORKERS_NAVIGATOR,
} from './constants'

export const isBun = !!process.versions.bun

export const isCloudflare =
  globalThis.navigator?.userAgent === CLOUDFLARE_WORKERS_NAVIGATOR

export const isDeno = !!(globalThis as any).Deno

export function shouldCompress(res: Response) {
  const type = res.headers.get('Content-Type')
  return type && COMPRESSIBLE_CONTENT_TYPE_REGEX.test(type)
}

export function shouldTransform(res: Response) {
  const cacheControl = res.headers.get('Cache-Control')
  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl || !CACHECONTROL_NOTRANSFORM_REGEXP.test(cacheControl)
}

export async function readContentLength(readable: ReadableStream, bytes: number) {
  const [content, stream] = readable.tee()

  let length = 0

  for await (const chunk of content) {
    length += chunk.length

    if (length >= bytes) {
      break
    }
  }

  return { stream, length }
}
