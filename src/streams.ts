import zstd from '@mongodb-js/zstd'

import type { NodeCompressionEncoding, NodeCompressionOptions } from '~/types'

import { brotli, zlib } from '~/imports'

export class ZstdCompressionStream extends TransformStream {
  constructor(level?: number) {
    super({
      async transform(chunk, controller) {
        controller.enqueue(await zstd.compress(chunk, level))
      },
    })
  }
}

export class BrotliCompressionStream extends TransformStream {
  constructor(level?: number) {
    const compressStream = new brotli.CompressStream(level)

    super({
      transform(chunk, controller) {
        controller.enqueue(compressStream.compress(chunk, chunk.length).buf)
      },
    })
  }
}

export class ZlibCompressionStream {
  readable: ReadableStream
  writable: WritableStream

  constructor(encoding: NodeCompressionEncoding, options?: NodeCompressionOptions) {
    let handle

    switch (encoding) {
      case 'br': {
        handle = zlib.createBrotliCompress(options)
        break
      }
      case 'deflate': {
        handle = zlib.createDeflate(options)
        break
      }
      case 'gzip': {
        handle = zlib.createGzip(options)
        break
      }
      default: {
        handle = zlib.createDeflateRaw(options) as never
      }
    }

    this.readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of handle.iterator()) {
          controller.enqueue(chunk)
        }
        controller.close()
      },
    })

    this.writable = new WritableStream({
      write: (chunk: Uint8Array) => handle.write(chunk) as any,
      close: () => handle.end() as any,
    })
  }
}
