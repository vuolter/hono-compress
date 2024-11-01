"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = exports.ACCEPTED_ENCODINGS = void 0;
const bun_1 = require("bun");
const stream_1 = require("./stream");
exports.ACCEPTED_ENCODINGS = ['br', 'gzip', 'deflate'];
const compress = ({ encoding, encodings = [...exports.ACCEPTED_ENCODINGS], options = {}, streamOptions = {}, threshold = 1024, } = {}) => {
    if (encoding) {
        encodings = [encoding];
    }
    const unsupportedEncoding = encodings.find((enc) => !exports.ACCEPTED_ENCODINGS.includes(enc));
    if (unsupportedEncoding) {
        throw new Error(`Invalid compression encoding: ${unsupportedEncoding}`);
    }
    return async function compress(c, next) {
        await next();
        let compressedBody;
        const body = c.res.body;
        if (!body) {
            return;
        }
        const acceptedEncoding = c.req.header('Accept-Encoding');
        if (!acceptedEncoding) {
            return;
        }
        const encoding = encodings.find((enc) => acceptedEncoding.includes(enc));
        if (!encoding) {
            return;
        }
        const isReadableStream = body instanceof ReadableStream;
        if (isReadableStream) {
            compressedBody = body.pipeThrough(new stream_1.CompressionStream(encoding, streamOptions));
        }
        else {
            const buffer = await c.req.arrayBuffer();
            if (buffer.byteLength < threshold) {
                return;
            }
            const compress = encoding === 'gzip' ? bun_1.gzipSync : bun_1.deflateSync;
            compressedBody = compress(buffer, options);
        }
        c.res = new Response(compressedBody, { headers: c.res.headers });
        c.res.headers.set('Content-Encoding', encoding);
    };
};
exports.compress = compress;
