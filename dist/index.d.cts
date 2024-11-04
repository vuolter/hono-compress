import { Context, MiddlewareHandler } from 'hono';
import { BrotliOptions, ZlibOptions } from 'node:zlib';

declare const ACCEPTED_ENCODINGS: readonly ["zstd", "br", "gzip", "deflate"];
declare const NODE_ENCODINGS: readonly ["br", "gzip", "deflate"];

type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number];
type NodeCompressionEncoding = (typeof NODE_ENCODINGS)[number];
type NodeCompressionOptions = BrotliOptions | ZlibOptions;
interface CompressOptions {
    encoding?: CompressionEncoding;
    encodings?: CompressionEncoding[];
    options?: NodeCompressionOptions;
    threshold?: number;
    zstdLevel?: number;
    brotliLevel?: number;
    zlibLevel?: number;
    filter?: (c: Context) => boolean;
}

declare const compress: ({ encoding, encodings, options, threshold, zstdLevel, brotliLevel, zlibLevel, filter, }?: CompressOptions) => MiddlewareHandler;

declare class ZstdCompressionStream extends TransformStream {
    constructor(level?: number);
}
declare class BrotliCompressionStream extends TransformStream {
    constructor(level?: number);
}
declare class ZlibCompressionStream {
    readable: ReadableStream;
    writable: WritableStream;
    constructor(encoding: NodeCompressionEncoding, options?: NodeCompressionOptions);
}

export { BrotliCompressionStream, type CompressOptions, type CompressionEncoding, type NodeCompressionEncoding, type NodeCompressionOptions, ZlibCompressionStream, ZstdCompressionStream, compress, compress as default };
