# hono-compress

Compression plugin for [Hono](https://github.com/honojs/hono)

Drop-in replacement of the official [Compress Middleware](https://hono.dev/docs/middleware/builtin/compress), but with extra features

### Features

- all compression formats allowed: `zstd`, `br`, `gzip`, `deflate`
- auto-select format according request headers
- configurable compression options
- response size threshold with stream data support
- compressed content detection
- Cloudflare Workers and Deno Deploy detection
- working with [Bun](https://bun.sh/)

## Installation

```bash
bun add github:vuolter/hono-compress
```

## Usage

```typescript
import { Hono } from 'hono'
import { compress } from 'hono-compress'

const app = new Hono()

app.use(compress())
```

## Configuration

### encoding

Defaults to `undefined`.

The encoding algorithm to use to compress the response content.
Can be one of the following:

- `zstd`
- `br`
- `gzip`
- `deflate`

If not defined, all the encodings are allowed based on the request header `Accept-Encoding` and will be used in their order of declaration.

### encodings

Defaults to `['zstd', 'br', 'gzip', 'deflate']`.

The encoding algorithms allowed to be used to compress the response content.

### options

Defaults to `{}`.

Options passed to the node compression engine to compress content.

Refer to the node Zlib [documentation](https://nodejs.org/api/zlib.html) for more details.

### threshold

Defaults to `1024`.

The minimum size in bytes for a response content to be compressed.

### zstdLevel

Defaults to `3`.

Zstandard algorithm compression level.

Refer to the zstd [manual](https://facebook.github.io/zstd/zstd_manual.html) for more details.
