# Effect Package Template

This template provides a solid foundation for building scalable and maintainable TypeScript package with Effect.

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

This project makes use of (https://bun.com/docs/test/snapshots)[Bun snapshot teseting], so you should also run

```sh
bun test --update-snapshots
```
