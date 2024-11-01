import { ACCEPTED_ENCODINGS } from "./middleware";
import type { BrotliOptions, ZlibOptions } from "node:zlib";
import type { ZlibCompressionOptions, LibdeflateCompressionOptions } from "bun";
export type CompressionEncoding = (typeof ACCEPTED_ENCODINGS)[number];
export type CompressionOptions = ZlibCompressionOptions | LibdeflateCompressionOptions;
export type CompressionStreamOptions = BrotliOptions | ZlibOptions;
export interface CompressOptions {
    type: CompressionEncoding;
    options?: CompressionOptions;
    streamOptions?: CompressionStreamOptions;
    threshold?: number;
}
