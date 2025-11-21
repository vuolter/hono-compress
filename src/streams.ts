import type {
  BunCompressionEncoding,
  BunCompressionOptions,
  CompressionEncoding,
  HonoCompressionStream,
  NodeCompressionEncoding,
  NodeCompressionOptions,
  WebCompressionEncoding,
} from '~/types'

import { BUN_ENCODINGS, WEB_ENCODINGS, ZLIB_ENCODINGS } from '~/constants'
import { isBunRuntime } from '~/helpers'
import { bun, stream, zlib } from '~/imports'

abstract class BaseCompressionStream
  extends TransformStream
  implements HonoCompressionStream
{
  encoding: CompressionEncoding
  options?: object

  constructor(
    encoding: CompressionEncoding,
    options?: object,
    transformer?: Transformer,
  ) {
    super(transformer)
    this.encoding = encoding
    this.options = options
  }

  static canHandle(_encoding: CompressionEncoding): boolean {
    throw new Error('Method not implemented')
  }
}

export class BunCompressionStream extends BaseCompressionStream {
  static readonly acceptedEncoding: ReadonlySet<string> = new Set(BUN_ENCODINGS)

  static readonly compressor = new Map([
    ['deflate', bun?.deflateSync],
    ['gzip', bun?.gzipSync],
    ['zstd', bun?.zstdCompressSync],
  ] as [string, CallableFunction][])

  constructor(
    encoding: BunCompressionEncoding,
    options?: BunCompressionOptions<typeof encoding>,
  ) {
    const compress = BunCompressionStream.compressor.get(encoding)!
    const transformer: Transformer = {
      transform(chunk, controller) {
        controller.enqueue(compress(chunk, options))
      },
    }
    super(encoding, options, transformer)
  }

  static override canHandle(encoding: CompressionEncoding): boolean {
    return (
      isBunRuntime &&
      BunCompressionStream.acceptedEncoding.has(encoding) &&
      BunCompressionStream.compressor.get(encoding) !== undefined
    )
  }
}

export class NodeCompressionStream extends BaseCompressionStream {
  static readonly acceptedEncoding: ReadonlySet<string> = new Set(ZLIB_ENCODINGS)

  override readable: ReadableStream
  override writable: WritableStream

  constructor(
    encoding: NodeCompressionEncoding,
    options?: NodeCompressionOptions<typeof encoding>,
  ) {
    super(encoding as CompressionEncoding, options)

    let handle

    const { windowBits, level, memLevel, params, ...rest } = (options as any) ?? {}
    const {
      ZSTD_c_windowLog,
      ZSTD_c_compressionLevel,
      BROTLI_PARAM_LGWIN,
      BROTLI_PARAM_QUALITY,
      BROTLI_PARAM_LGBLOCK,
    } = zlib.constants

    switch (encoding) {
      case 'br': {
        handle = zlib.createBrotliCompress({
          params: {
            ...(windowBits && { [BROTLI_PARAM_LGWIN]: windowBits }),
            ...(level && { [BROTLI_PARAM_QUALITY]: level }),
            ...(memLevel && { [BROTLI_PARAM_LGBLOCK]: memLevel }),
            ...params,
          },
          ...rest,
        })
        break
      }
      case 'deflate': {
        handle = zlib.createDeflate(options)
        break
      }
      case 'deflate-raw': {
        handle = zlib.createDeflateRaw(options)
        break
      }
      case 'gzip': {
        handle = zlib.createGzip(options)
        break
      }
      case 'zstd': {
        handle = zlib.createZstdCompress({
          params: {
            ...(windowBits && { [ZSTD_c_windowLog]: windowBits }),
            ...(level && { [ZSTD_c_compressionLevel]: level }),
            ...params,
          },
          ...rest,
        })
        break
      }
    }

    const { readable, writable } = stream.Duplex.toWeb(handle)

    this.readable = readable as unknown as ReadableStream
    this.writable = writable
  }

  static override canHandle(encoding: CompressionEncoding): boolean {
    return zlib != undefined && NodeCompressionStream.acceptedEncoding.has(encoding)
  }
}

export class WebCompressionStream extends BaseCompressionStream {
  static readonly acceptedEncoding: ReadonlySet<string> = new Set(WEB_ENCODINGS)

  override readable: ReadableStream
  override writable: WritableStream

  constructor(encoding: WebCompressionEncoding) {
    super(encoding as CompressionEncoding)

    const compression = new CompressionStream(encoding)

    this.readable = compression.readable
    this.writable = compression.writable
  }

  static override canHandle(encoding: CompressionEncoding): boolean {
    return WebCompressionStream.acceptedEncoding.has(encoding)
  }
}
