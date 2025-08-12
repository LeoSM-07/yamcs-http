import { HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"
import * as yamcs from "../types.js"

const instanceParam = HttpApiSchema.param("instance", Schema.String)
const nameParam = HttpApiSchema.param("name", yamcs.QualifiedName)

const ListParametersResponse = Schema.Struct({
  spaceSystems: Schema.optional(Schema.Array(yamcs.SpaceSystemInfo)),
  parameters: Schema.Array(yamcs.ParameterInfo),

  continuationToken: Schema.optional(Schema.String),
  totalSize: Schema.Int
})

const ListSpaceSystemsResponse = Schema.Struct({
  spaceSystems: Schema.Array(yamcs.SpaceSystemInfo),

  continuationToken: Schema.optional(Schema.String),
  totalSize: Schema.Int
})

export const mdbGroup = HttpApiGroup.make("mdb")
  .add(
    HttpApiEndpoint.get("getMissionDatabase")`/${instanceParam}`
      .addSuccess(yamcs.MissionDatabase)
  )
  .add(
    HttpApiEndpoint.get("listParameters")`/${instanceParam}/parameters`
      .addSuccess(ListParametersResponse)
  )
  .add(
    HttpApiEndpoint.get("getParameter")`/${instanceParam}/parameters/${nameParam}`
      .addSuccess(yamcs.ParameterInfo)
  )
  .add(
    HttpApiEndpoint.get("getSpaceSystem")`/${instanceParam}/space-systems/${nameParam}`
      .addSuccess(yamcs.SpaceSystemInfo)
  )
  .add(
    HttpApiEndpoint.get("listSpaceSystems")`/${instanceParam}/space-systems`
      .addSuccess(ListSpaceSystemsResponse)
  )
  .addError(HttpApiError.NotFound)
  .prefix("/mdb")

export default mdbGroup
