import { FetchHttpClient, HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiGroup, HttpClient } from "@effect/platform"
import { Effect, Layer, Logger, LogLevel, Schema } from "effect"
import * as yamcs from "./types.ts"

const ListParametersResponse = Schema.Struct({
  // Matching subsystems when the ``system`` option was specified
  spaceSystems: Schema.optional(Schema.Array(yamcs.SpaceSystemInfo)),

  // Matching parameters
  parameters: Schema.Array(yamcs.ParameterInfo),

  // Token indicating the response is only partial. More results can then
  // be obtained by performing the same request (including all original
  // query parameters) and setting the ``next`` parameter to this token.
  continuationToken: Schema.optional(Schema.String),

  // The total number of results (across all pages)
  totalSize: Schema.Int
})

const MDBGroup = HttpApiGroup.make("MDB")
  .prefix("/mdb")
  .add(
    HttpApiEndpoint.get("get_mission_database", "/:instance").setPath(
      Schema.Struct({
        instance: Schema.String
      })
    ).addSuccess(yamcs.MissionDatabase)
  )
  .add(
    HttpApiEndpoint.get("get_parameters", "/:instance/parameters").setPath(
      Schema.Struct({
        instance: Schema.String
      })
    ).addSuccess(ListParametersResponse)
  )
  .add(
    HttpApiEndpoint.get("get_parameter", "/:instance/parameters/:name").setPath(
      Schema.Struct({
        instance: Schema.String,
        name: yamcs.QualifiedName
      })
    ).addSuccess(yamcs.ParameterInfo)
  )

const YamcsApi = HttpApi.make("YAMCS").add(MDBGroup).prefix("/yamcs/api")

export class Yamcs extends Effect.Service<Yamcs>()("yamcs", {
  // Specify dependencies
  dependencies: [FetchHttpClient.layer],
  // Define how to create the service
  effect: Effect.gen(function*() {
    const client = yield* HttpApiClient.make(YamcsApi, {
      baseUrl: "http://localhost:8090",
      transformClient: (client) => {
        return client.pipe(
          HttpClient.tapRequest((req) => Effect.logDebug(`[YAMCS HTTP]: ${req.url}`))
        )
      }
    })

    return client
  })
}) {}

const program = Effect.gen(function*() {
  const yamcs = yield* Yamcs

  const result = yield* yamcs.MDB["get_mission_database"]({
    path: {
      instance: "a"
    }
  })

  yield* Effect.log(result)
}).pipe(
  // Effect.catchTag("NotFound", () => Effect.logError("Element Not Found")),
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
