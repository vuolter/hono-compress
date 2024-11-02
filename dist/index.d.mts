import { MiddlewareHandler } from 'hono';
import { BrotliOptions, ZlibOptions } from 'node:zlib';

declare const ZSTD_ENCODINGS: readonly ["zstd"];
declare const NODE_ENCODINGS: readonly ["br", "gzip", "deflate"];
declare const WEB_ENCODINGS: readonly ["gzip", "deflate"];

type ZstdCompressionEncoding = (typeof ZSTD_ENCODINGS)[number];
type NodeCompressionEncoding = (typeof NODE_ENCODINGS)[number];
type NodeCompressionOptions = BrotliOptions | ZlibOptions;
type WebCompressionEncoding = (typeof WEB_ENCODINGS)[number];
type CompressionEncoding = ZstdCompressionEncoding | NodeCompressionEncoding | WebCompressionEncoding;
interface CompressOptions {
    encoding?: CompressionEncoding;
    encodings?: CompressionEncoding[];
    options?: NodeCompressionOptions;
    threshold?: number;
    zstdLevel?: number;
}

declare const compress: ({ encoding, encodings, options, threshold, zstdLevel, }?: CompressOptions) => MiddlewareHandler;

declare class NodeCompressionStream {
    readable: ReadableStream;
    writable: WritableStream;
    constructor(encoding: NodeCompressionEncoding, options?: NodeCompressionOptions);
}

export { type CompressOptions, type CompressionEncoding, type NodeCompressionEncoding, type NodeCompressionOptions, NodeCompressionStream, type WebCompressionEncoding, type ZstdCompressionEncoding, compress, compress as default };
