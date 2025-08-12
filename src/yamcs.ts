import { FetchHttpClient, HttpApi, HttpApiClient, HttpClient } from "@effect/platform"
import { Effect } from "effect"
import mdbGroup from "./groups/mdb.js"

export const YamcsApi = HttpApi.make("YAMCS")
  .add(mdbGroup)
  .prefix("/yamcs/api")

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
