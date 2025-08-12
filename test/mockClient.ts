import { HttpClient, HttpClientResponse } from "@effect/platform"
import type { HttpClientRequest } from "@effect/platform/HttpClientRequest"
import { Effect, Layer, Logger, LogLevel } from "effect"
import { Yamcs } from "src/yamcs.js"

import getMissionDatabase from "./mock/mdb/getMissionDatabase.json" with { type: "json" }
import getParameter from "./mock/mdb/getParameter.json" with { type: "json" }
import getSpaceSystem from "./mock/mdb/getSpaceSystem.json" with { type: "json" }
import listParameters from "./mock/mdb/listParameters.json" with { type: "json" }
import listSpaceSystems from "./mock/mdb/listSpaceSystems.json" with { type: "json" }

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
      return makeJSONResponse(req, listParameters)
    case "/mdb/gs_backend/space-systems//":
      return makeJSONResponse(req, getSpaceSystem)
    case "/mdb/gs_backend/space-systems":
      return makeJSONResponse(req, listSpaceSystems)
    case "/mdb/gs_backend":
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

export const TestLayer = Layer.mergeAll(
  Yamcs.DefaultWithoutDependencies,
  Logger.minimumLogLevel(LogLevel.Warning),
  Logger.pretty
).pipe(
  Layer.provide(TestClient)
)
