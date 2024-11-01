import zlib from "node:zlib";
export class CompressionStream {
    readable;
    writable;
    constructor(encoding, options) {
        let handle;
        switch (encoding) {
            case "br": {
                handle = zlib.createBrotliCompress(options);
                break;
            }
            case "gzip": {
                handle = zlib.createGzip(options);
                break;
            }
            case "deflate": {
                handle = zlib.createDeflate(options);
                break;
            }
            default: {
                handle = zlib.createDeflateRaw(options);
            }
        }
        this.readable = new ReadableStream({
            start(controller) {
                handle.on("data", (chunk) => controller.enqueue(chunk));
                handle.once("end", controller.close);
            },
        });
        this.writable = new WritableStream({
            write: (chunk) => handle.write(chunk),
            close: handle.end,
        });
    }
}
