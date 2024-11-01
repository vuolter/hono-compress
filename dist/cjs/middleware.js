"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = exports.ACCEPTED_ENCODINGS = void 0;
const bun_1 = require("bun");
const stream_1 = require("./stream");
exports.ACCEPTED_ENCODINGS = ["br", "gzip", "deflate"];
const compress = ({ type, options = {}, streamOptions = {}, threshold = 1024 } = {
    type: "gzip",
}) => {
    if (!exports.ACCEPTED_ENCODINGS.includes(type)) {
        throw new Error(`Invalid compression type: ${type}`);
    }
    return async function compress(c, next) {
        await next();
        let compressedBody;
        const isAcceptedEncoding = c.req.header("Accept-Encoding")?.includes(type);
        if (!isAcceptedEncoding || !c.res.body) {
            return;
        }
        const isReadableStream = c.res.body instanceof ReadableStream;
        if (isReadableStream) {
            compressedBody = c.res.body.pipeThrough(new stream_1.CompressionStream(type, streamOptions));
        }
        else {
            const buffer = await c.req.arrayBuffer();
            if (buffer.byteLength < threshold) {
                return;
            }
            const compress = type === "gzip" ? bun_1.gzipSync : bun_1.deflateSync;
            compressedBody = compress(buffer, options);
        }
        c.res = new Response(compressedBody, { headers: c.res.headers });
        c.res.headers.set("Content-Encoding", type);
    };
};
exports.compress = compress;
