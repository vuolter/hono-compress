import {
  createBrotliCompress,
  createGzip,
  createDeflate,
  createDeflateRaw,
} from 'node:zlib'

import type { NodeCompressionEncoding, NodeCompressionOptions } from './types'
// import { isBun } from './helpers'

export class NodeCompressionStream {
  readable: ReadableStream
  writable: WritableStream

  constructor(encoding: NodeCompressionEncoding, options?: NodeCompressionOptions) {
    let handle

    switch (encoding) {
      case 'br': {
        handle = createBrotliCompress(options)
        break
      }
      case 'gzip': {
        handle = createGzip(options)
        break
      }
      case 'deflate': {
        handle = createDeflate(options)
        break
      }
      default: {
        handle = createDeflateRaw(options) as never
      }
    }

    // if (isBun) {
    //   this.readable = new ReadableStream({
    //     type: 'direct',
    //     pull(controller) {
    //       handle.on('data', (chunk: Uint8Array) => controller.write(chunk))
    //       handle.once('end', () => controller.close())
    //     },
    //   })
    // } else {
    this.readable = new ReadableStream({
      start(controller) {
        handle.on('data', (chunk: Uint8Array) => controller.enqueue(chunk))
        handle.once('end', () => controller.close())
      },
    })
    // }

    this.writable = new WritableStream({
      write: (chunk: Uint8Array) => handle.write(chunk) as any,
      close: () => handle.end() as any,
    })
  }
}
