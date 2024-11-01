# bun-compression

Compression plugin for [Hono](https://github.com/honojs/hono)

## Installation

```bash
bun add github:hono-compress
```

## Example

```typescript
import { Hono } from 'hono'
import { compress } from 'hono-compress'

const app = new Hono()

app.use('*', compress())
```

## Config

### type

@default `gzip`

The type of compression to use. Can be one of the following:

- `gzip`
- `deflate`

### options

@default `{}`

Options passed to the compression library.

Refer to the bun zlib options [documentation](https://bun.sh/docs/api/utils#bun-gzipsync) for more details.

### encoding

@default `utf-8`

The encoding of the response body that is being compressed.

## Acknowledgments

This project is inspired by [elysia-compression](https://github.com/gusb3ll/elysia-compression) by [gusb3ll](https://github.com/gusb3ll). Adaptations have been made to support Hono.
