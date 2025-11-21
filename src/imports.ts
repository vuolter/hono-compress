const bunPromise: Promise<typeof import('bun')> = import('bun')
const streamPromise: Promise<typeof import('node:stream')> = import(
  'node:stream'
) as unknown as Promise<typeof import('node:stream')>
const zlibPromise: Promise<typeof import('node:zlib')> = import('node:zlib')

export let bun: Awaited<typeof bunPromise>
export let stream: Awaited<typeof streamPromise>
export let zlib: Awaited<typeof zlibPromise>

bunPromise
  .then((module) => {
    bun = module
  })
  .catch(() => null)
streamPromise
  .then((module) => {
    stream = module
  })
  .catch(() => null)
zlibPromise
  .then((module) => {
    zlib = module
  })
  .catch(() => null)
