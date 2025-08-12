import { describe, expect, it } from "bun:test"
import { Effect } from "effect"
import { Yamcs, YamcsApi } from "src/yamcs.js"
import { TestLayer } from "./mockClient.js"

const endpoints = YamcsApi.groups.mdb.endpoints
describe("mdb", () => {
  Object.keys(endpoints).map((endpoint) =>
    it(endpoint, async () => {
      const program = Effect.gen(function*() {
        const yamcs = yield* Yamcs

        const params: any = {
          instance: "gs_backend"
        }

        if (endpoint.includes("Parameter")) {
          params.name = "/FC433/FlightComputer/pl_battery_voltage"
        } else if (endpoint.includes("SpaceSystem")) {
          params.name = "/"
        }

        // @ts-expect-error Endpoint is a valid key of yamcs.mdb
        const result = yield* yamcs.mdb[endpoint]({
          path: params
        })

        return result
      }).pipe(
        Effect.provide(TestLayer)
      )

      // @ts-ignore assuming we've provided everything it needs
      const result = await Effect.runPromise(program)
      expect(result).toMatchSnapshot()
    })
  )
})
