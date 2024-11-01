"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionStream = void 0;
const node_zlib_1 = __importDefault(require("node:zlib"));
class CompressionStream {
    readable;
    writable;
    constructor(encoding, options) {
        let handle;
        switch (encoding) {
            case 'br': {
                handle = node_zlib_1.default.createBrotliCompress(options);
                break;
            }
            case 'gzip': {
                handle = node_zlib_1.default.createGzip(options);
                break;
            }
            case 'deflate': {
                handle = node_zlib_1.default.createDeflate(options);
                break;
            }
            default: {
                handle = node_zlib_1.default.createDeflateRaw(options);
            }
        }
        this.readable = new ReadableStream({
            start(controller) {
                handle.on('data', (chunk) => controller.enqueue(chunk));
                handle.once('end', () => controller.close());
            },
        });
        this.writable = new WritableStream({
            write: (chunk) => handle.write(chunk),
            close: () => handle.end(),
        });
    }
}
exports.CompressionStream = CompressionStream;
