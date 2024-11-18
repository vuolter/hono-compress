import { COMPRESSIBLE_CONTENT_TYPE_REGEX } from 'hono/utils/compress'

import {
  CACHECONTROL_NOTRANSFORM_REGEXP,
  CLOUDFLARE_WORKERS_NAVIGATOR,
} from '~/constants'

export const isCloudflareWorkers =
  globalThis.navigator?.userAgent === CLOUDFLARE_WORKERS_NAVIGATOR

export const isDenoDeploy =
  (globalThis as any).Deno?.env?.get('DENO_DEPLOYMENT_ID') !== undefined

export function shouldCompress(res: Response, force: false) {
  const type = res.headers.get('Content-Type')
  return type ? COMPRESSIBLE_CONTENT_TYPE_REGEX.test(type) : force
}

export function shouldTransform(res: Response) {
  const cacheControl = res.headers.get('Cache-Control')
  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl || !CACHECONTROL_NOTRANSFORM_REGEXP.test(cacheControl)
}

const brotliPromise = import('brotli-wasm')

export let brotli: Awaited<typeof brotliPromise>

brotliPromise.then((module) => {
  brotli = module
})

const zlibPromise = import('node:zlib')

export let zlib: Awaited<typeof zlibPromise>

zlibPromise
  .then((module) => {
    zlib = module
  })
  .catch(() => null)
