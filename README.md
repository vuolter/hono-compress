# hono-compress

Compression plugin for [Hono](https://github.com/honojs/hono)

Drop-in replacement of the built-in [Compress Middleware](https://hono.dev/docs/middleware/builtin/compress), but with extra juice! 🍋

## Features

- 💯 content compression with `zstd`, `brotli`, `gzip`, `deflate`
- ✨ ultra-fast and 100% type-safe
- 🚀 optimized for [Bun](https://bun.sh/)
- 🎥 streaming response support
- 🌻 automatic encoding selection
- ⚙️ customizable compression level and options
- 🎱 content size threshold and custom filtering
- 🛡️ double-compression protection
- 🎯 fully documented and tested
- ☕ works flawlessy on [Node](https://nodejs.org/), [Deno](https://deno.com/), Cloudflare Workers, Deno Deploy and many edge runtimes

## What's Up Doc

This project born as a fork of [bun-compression](https://github.com/sunneydev/bun-compression), which itself was a fork of [elysia-compression](https://github.com/gusb3ll/elysia-compression).

Both projects were broken, unmaintained and missing many of the features I was looking for, so I started with them, but ended up improving and expanding all so much that everything has been completely rewritten from scratch at this point.

This project has been also inspired by [hono/compress](https://github.com/honojs/hono), [expressjs/compression](https://github.com/expressjs/compression) and [elysia-compress](https://github.com/vermaysha/elysia-compress).

## Installation

<details open>
<summary>Bun</summary>

```bash
bun add hono-compress
```

</details>

<details>
<summary>npm</summary>

```bash
npm install hono-compress
```

</details>

<details>
<summary>pnpm</summary>

```bash
pnpm add hono-compress
```

</details>

<details>
<summary>Yarn</summary>

```bash
yarn add hono-compress
```

</details>

<details>
<summary>Deno</summary>

```bash
deno add hono-compress
```

</details>

## Quick Start

```typescript
import { Hono } from 'hono'
import { compress } from 'hono-compress'

const app = new Hono()

app.use(compress())
```

## Usage

### `compress(options: HonoCompressOptions)`

Creates a middleware function for compressing response content.

```typescript
compress({
  encoding,
  encodings,
  fallback,
  force,
  strict,
  stream,
  bun,
  node,
  threshold,
  zstdLevel,
  brotliLevel,
  gzipLevel,
  deflateLevel,
  zstdOptions,
  brotliOptions,
  gzipOptions,
  deflateOptions,
  filter,
})
```

## Options

```typescript
interface HonoCompressOptions {
  encoding?: CompressionEncoding
  encodings?: CompressionEncoding[]
  fallback?: CompressionEncoding
  force?: boolean
  strict?: boolean
  stream?: boolean
  bun?: boolean
  node?: boolean
  threshold?: number
  zstdLevel?: ZstdLevel
  zstdOptions?: ZstdOptions
  brotliLevel?: BrotliLevel
  brotliOptions?: BrotliOptions
  gzipLevel?: ZlibLevel
  gzipOptions?: ZlibOptions
  deflateLevel?: ZlibLevel
  deflateOptions?: ZlibOptions
  filter?: CompressionCallback
}
```

### encoding

Defaults to `undefined`.

The encoding format to be used to compress the response content.
Can be only one of the following (sorted in descending order by performance):

- `zstd`
- `br`
- `gzip`
- `deflate`

If not defined, all the formats declared in the option `encodings` can be used.

This option is provided primarily to maintain compatibility with `hono/compress`, use the option `encodings` to set the wanted compression formats.

### encodings

Defaults to `['zstd', 'br', 'gzip', 'deflate']`.

The encoding formats allowed to be used to compress the response content.

The first matching the request accept-encoding according their order of declaration is chosen to compress the response content.

### fallback

Defaults to `undefined`.

The encoding format to be used as fallback to compress the response content if no accept-encoding header is request by the client.
If not defined, content will not be compressed.

### force

Defaults to `false`.

Forces the content compression even if the response content-type cannot be determined and the cache-control is set to no-transform.

### strict

Defaults to `true`.

Complies with the client request directives.
Disables the content compression if find the x-no-compression header.

### stream

Defaults to `true`.

Streams compressed content in chunked response.

Can be set to `undefined` to automatically detect when disable streaming compression.
Always enabled by default to increase performances.

### bun

Defaults to `true`.

Allows Bun compressor to be used.

### node

Defaults to `true`.

Allows Node compressor to be used.

### threshold

Defaults to `1024`.

The minimum size in bytes for a response content to be compressed.

### zstdLevel

Defaults to `2`, min `1`, max `22`.

Zstandard algorithm compression level (format `zstd`).

### brotliLevel

Defaults to `4`, min `0`, max `11`.

Brotli algorithm compression level (format `br`).

### gzipLevel

Defaults to `6`, min `0`, max `6`.

Gzip algorithm compression level (format `gzip`).

### deflateLevel

Defaults to `6`, min `0`, max `6`.

Deflate algorithm compression level (format `deflate`).

### zstdOptions

Defaults to `undefined`.

Zstandard algorithm compression options (format `zstd`).

Refer to the zstd [manual](https://facebook.github.io/zstd/zstd_manual.html) for more details.

### brotliOptions

Defaults to `undefined`.

Brotli algorithm compression options (format `br`).

Refer to the Brotli [specification](https://www.ietf.org/rfc/rfc7932.txt) for more details.

### gzipOptions

Defaults to `undefined`.

Gzip algorithm compression options (format `gzip`).

Refer to the zlib [manual](https://zlib.net/manual.html) for more details.

### deflateOptions

Defaults to `undefined`.

Deflate algorithm compression options (format `deflate`).

Refer to the zlib [manual](https://zlib.net/manual.html) for more details.

### filter

Defaults to `undefined`.

Optional function callback used to check if the response content should be compressed or not.

Overrides all the internal checks. Use with caution.

#### Parameters

- [Hono Context](https://hono.dev/docs/api/context)

#### Return value

Boolean

Example of forcing the response content to be always compressed:

```typescript
import type { Context } from 'hono'

compress({
  filter: (c: Context) => true,
})
```
