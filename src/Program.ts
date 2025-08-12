import { Effect, Layer, Logger, LogLevel } from "effect"
import { Yamcs } from "./yamcs-http.ts"

const program = Effect.gen(function*() {
  const yamcs = yield* Yamcs

  const result = yield* yamcs.MDB["get_mission_database"]({
    path: {
      instance: "gs_backend"
    }
  })

  yield* Effect.log(result)
}).pipe(
  Effect.catchTag("NotFound", () => Effect.logError("Element Not Found")),
  Effect.catchTag("ParseError", (e) => Effect.logError("Decoding Error: " + e.message)),
  Effect.catchAll((e) => Effect.logError(e.message))
)

const runnable = program.pipe(
  Effect.provide(
    Layer.mergeAll(
      Yamcs.Default,
      Logger.minimumLogLevel(LogLevel.Debug),
      Logger.pretty
    )
  )
)
// Provide a Fetch-based HTTP client and run the program
Effect.runFork(runnable)
