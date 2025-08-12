# Yamcs HTTP

This package aims to provide a safe and alternative HTTP client for [Yamcs](https://github.com/yamcs/yamcs). It integrates with the server's built-in API.

This project heavily makes use of [Effect.ts](https://effect.website/docs) for schema decoding, error handling, and its HTTP client.

You can access the client in an Effect with:

```typescript
const program = Effect.gen(function* () {
    const yamcs = yield* Yamcs;
    // You can do anything here
    yield* yamcs.getParameter(...)
}).pipe(
    Effect.provide(Yamcs.Default)
);
```

> [!WARNING]  
> This project is still a work in progress, and most features are not yet implemented.

## Running Code

To execute a file with `bun`:

```sh
bun ./src/Program.ts
```

## Operations

**Building**

To build the package:

```sh
bun build
```

**Testing**

To test the package:

```sh
bun test
```

This project makes use of [Bun snapshot testing](https://bun.com/docs/test/snapshots), so you should also run:

```sh
bun test --update-snapshots
```
