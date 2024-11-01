import type { CompressionEncoding, CompressionStreamOptions } from "./types";
export declare class CompressionStream {
    readable: ReadableStream;
    writable: WritableStream;
    constructor(encoding: CompressionEncoding, options?: CompressionStreamOptions);
}
