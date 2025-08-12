import { describe, expect, it } from "bun:test"
import { Effect, Layer, Logger, LogLevel } from "effect"
import { Yamcs } from "src/yamcs-http.js"

const testLayer = Layer.mergeAll(
  Yamcs.Default,
  Logger.minimumLogLevel(LogLevel.Warning),
  Logger.pretty
)

describe("Yamcs MDB", () => {
  it("Decode MDB Instance", async () => {
    const program = Effect.gen(function*() {
      const yamcs = yield* Yamcs
      const result = yield* yamcs.MDB.getMissionDatabase({ path: { instance: "gs_backend" } })
      return result
    }).pipe(
      Effect.provide(testLayer)
    )

    const result = await Effect.runPromise(program)
    expect(result).toMatchSnapshot()
  })

  it("Decode Parameters List", async () => {
    const program = Effect.gen(function*() {
      const yamcs = yield* Yamcs
      const result = yield* yamcs.MDB.getParameters({
        path: {
          instance: "gs_backend"
        }
      })
      return result
    }).pipe(
      Effect.provide(testLayer)
    )

    const result = await Effect.runPromise(program)
    expect(result).toMatchSnapshot()
  })

  it("Decode Single Parameter", async () => {
    const program = Effect.gen(function*() {
      const yamcs = yield* Yamcs
      const result = yield* yamcs.MDB.getParameter({
        path: {
          instance: "gs_backend",
          name: "/FC433/FlightComputer/pl_battery_voltage"
        }
      })
      return result
    }).pipe(
      Effect.provide(testLayer)
    )

    const result = await Effect.runPromise(program)
    expect(result).toMatchSnapshot()
  })
})
