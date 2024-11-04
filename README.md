# hono-compress

Compression plugin for [Hono](https://github.com/honojs/hono)

Drop-in replacement of the official [Compress Middleware](https://hono.dev/docs/middleware/builtin/compress), but with extra features

### Features

- all compression formats: `zstd`, `br`, `gzip`, `deflate`
- auto-select format according request headers
- configurable compression options
- content size threshold
- compressed content detection
- custom filtering
- Cloudflare Workers and Deno Deploy checks
- works under Node, edge runtimes and [Bun](https://bun.sh/)

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

### Configuration

```typescript
compress({ encoding, encodings, options, threshold, zstdLevel })
```

#### encoding

Defaults to `undefined`.

The compression format to use to compress the response content.
Can be one of the following:

- `zstd`
- `br`
- `gzip`
- `deflate`

If not defined, all the supported encodings are allowed based on the request header `Accept-Encoding` and will be used in their order of declaration.

This option is available mainly to maintain compatibility with `hono/compress`, it's recommended to set the compression formats using `encodings` instead.

#### encodings

Defaults to `['zstd', 'br', 'gzip', 'deflate']`.

The compression formats allowed to be used to compress the response content.

#### options

Defaults to `{}`.

Options passed to the node compression engine to compress content.

Refer to the node zlib [documentation](https://nodejs.org/api/zlib.html) for more details.

#### threshold

Defaults to `1024`.

The minimum size in bytes for a response content to be compressed.

#### zstdLevel

Defaults to `3`.

Zstandard algorithm compression level.

Refer to the zstd [manual](https://facebook.github.io/zstd/zstd_manual.html) for more details.

#### brotliLevel

Defaults to `11`.

Brotli algorithm compression level.

#### zlibLevel

Defaults to `6`.

Zlib algorithms compression level.

#### filter

Defaults to `undefined`.

A function callback to state if response content can be compressed or not.
