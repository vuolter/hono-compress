import zlib from 'node:zlib'

import type { CompressionEncoding, CompressionStreamOptions } from './types'

export class CompressionStream {
  readable: ReadableStream
  writable: WritableStream

  constructor(encoding: CompressionEncoding, options?: CompressionStreamOptions) {
    let handle

    switch (encoding) {
      case 'br': {
        handle = zlib.createBrotliCompress(options)
        break
      }
      case 'gzip': {
        handle = zlib.createGzip(options)
        break
      }
      case 'deflate': {
        handle = zlib.createDeflate(options)
        break
      }
      default: {
        handle = zlib.createDeflateRaw(options) as never
      }
    }

    this.readable = new ReadableStream({
      start(controller) {
        handle.on('data', (chunk: Uint8Array) => controller.enqueue(chunk))
        handle.once('end', () => controller.close())
      },
    })

    this.writable = new WritableStream({
      write: (chunk: Uint8Array) => handle.write(chunk) as any,
      close: () => handle.end() as any,
    })
  }
}
