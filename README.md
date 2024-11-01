# hono-compress

Compression plugin for [Hono](https://github.com/honojs/hono)

Drop-in replacement of the official `hono-compress` middleware, but with `brotli` compression and response size threshold.

## Installation

```bash
bun add github:vuolter/hono-compress
```

## Example

```typescript
import { Hono } from "hono"
import { compress } from "hono-compress"

const app = new Hono()

app.use("*", compress())
```

## Configuration

### encoding

Defaults to `undefined`.

The encoding algorithm to use to compress the response content.
Can be one of the following:

- `br`
- `gzip`
- `deflate`

If not defined, all the encodings are allowed based on the request `Accept-Encoding` header and will be tried in their order of declaration.

### encodings

Defaults to `['br', 'gzip', 'deflate']`.

The encoding algorithms allowed to be used to compress the response content.

### options

Defaults to `{}`.

Options passed to the compression engine to compress fixed-length content.

Refer to the bun zlib options [documentation](https://bun.sh/docs/api/utils#bun-gzipsync) for more details.

### streamOptions

Defaults to `{}`.

Options passed to the compression engine to compress streaming content.

### threshold

Defaults to `1024`.

The minimum size in bytes for a response content to be compressed.
