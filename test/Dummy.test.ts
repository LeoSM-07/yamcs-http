import { HttpClient, HttpClientResponse } from "@effect/platform"
import type { HttpClientRequest } from "@effect/platform/HttpClientRequest"
import { describe, expect, it } from "bun:test"
import { Effect, Layer, Logger, LogLevel } from "effect"
import { Yamcs } from "src/yamcs-http.js"
import getMissionDatabase from "./snapshots/mdb/getMissionDatabase.json" with { type: "json" }
import getParameter from "./snapshots/mdb/getParameter.json" with { type: "json" }
import getParameters from "./snapshots/mdb/getParameters.json" with { type: "json" }

const makeJSONResponse = (req: HttpClientRequest, json: any) =>
  Effect.succeed(
    HttpClientResponse.fromWeb(
      req,
      new Response(
        JSON.stringify(json),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    )
  )

const myClient = HttpClient.make((req) => {
  const url = req.url.replace("http://localhost:8090/yamcs/api", "")

  switch (url) {
    case "/mdb/gs_backend/parameters//FC433/FlightComputer/pl_battery_voltage":
      return makeJSONResponse(req, getParameter)
    case "/mdb/gs_backend/parameters":
      return makeJSONResponse(req, getParameters)
    case "/mdb":
      return makeJSONResponse(req, getMissionDatabase)
    default:
      // Default response for any other URL
      return Effect.succeed(
        HttpClientResponse.fromWeb(
          req,
          new Response(
            JSON.stringify({
              message: `Unhandled URL: ${url}`
            }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          )
        )
      )
  }
})

const TestClient = Layer.succeed(HttpClient.HttpClient, myClient)

const TestLayer = Layer.mergeAll(
  Yamcs.DefaultWithoutDependencies,
  Logger.minimumLogLevel(LogLevel.Warning),
  Logger.pretty
).pipe(
  Layer.provide(TestClient)
)

describe("MDB", () => {
  it("getMissionDatabase", async () => {
    const program = Effect.gen(function*() {
      const yamcs = yield* Yamcs
      const result = yield* yamcs.MDB.getMissionDatabase({ path: { instance: "gs_backend" } })
      return result
    }).pipe(
      Effect.provide(TestLayer)
    )

    const result = await Effect.runPromise(program)
    expect(result).toMatchObject(getMissionDatabase)
  })

  it("Decode `getParameters`", async () => {
    const program = Effect.gen(function*() {
      const yamcs = yield* Yamcs
      const result = yield* yamcs.MDB.getParameters({
        path: {
          instance: "gs_backend"
        }
      })
      return result
    }).pipe(
      Effect.provide(TestLayer)
    )

    const result = await Effect.runPromise(program)
    expect(result).toMatchObject(getParameters)
  })

  it("Decode `getParameter`", async () => {
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
      Effect.provide(TestLayer)
    )

    const result = await Effect.runPromise(program)
    expect(result).toMatchObject(getParameter)
  })
})
