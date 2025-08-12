import {
  FetchHttpClient,
  HttpApi,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpClient
} from "@effect/platform"
import { Effect, Schema } from "effect"
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
  .add(
    HttpApiEndpoint.get("getMissionDatabase", "/:instance").setPath(
      Schema.Struct({ instance: Schema.String })
    ).addSuccess(yamcs.MissionDatabase)
  )
  .add(
    HttpApiEndpoint.get("getParameters", "/:instance/parameters").setPath(
      Schema.Struct({ instance: Schema.String })
    ).addSuccess(ListParametersResponse)
  )
  .add(
    HttpApiEndpoint.get("getParameter", "/:instance/parameters/:name").setPath(
      Schema.Struct({
        instance: Schema.String,
        name: yamcs.QualifiedName
      })
    ).addSuccess(yamcs.ParameterInfo)
  )
  .addError(HttpApiError.NotFound)
  .prefix("/mdb")

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
