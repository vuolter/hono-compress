const brotliPromise = import('brotli-wasm')
const zlibPromise = import('node:zlib')

export let brotli: Awaited<typeof brotliPromise>
export let zlib: Awaited<typeof zlibPromise>

brotliPromise.then((module) => {
  brotli = module
})

zlibPromise
  .then((module) => {
    zlib = module
  })
  .catch(() => null)
