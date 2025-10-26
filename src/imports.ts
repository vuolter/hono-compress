const bunPromise = import('bun')
const streamPromise = import('node:stream')
const zlibPromise = import('node:zlib')

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
