import { ParseResult, Schema } from "effect"

export const NamedObjectId = Schema.Struct({
  name: Schema.String,
  namespace: Schema.optional(Schema.String)
})

export const QualifiedName = Schema.String

const name = Schema.String
const qualifiedName = QualifiedName

// Short description (one line)
const shortDescription = Schema.optional(Schema.String)

// Long description (Markdown)
const longDescription = Schema.optional(Schema.String)
const alias = Schema.optional(Schema.Array(NamedObjectId))

export const UnitInfo = Schema.Struct({
  unit: Schema.String
})

export const PolynomialCalibratorInfo = Schema.TaggedStruct("POLYNOMIAL", {
  coefficients: Schema.Array(Schema.Number)
})

export const SplinePointInfo = Schema.Struct({
  raw: Schema.Number,
  calibrated: Schema.Number
})

export const SplineCalibratorInfo = Schema.TaggedStruct("SPLINE", {
  points: Schema.Array(SplinePointInfo)
})

export const JavaExpressionCalibratorInfo = Schema.TaggedStruct("JAVA_EXPRESSION", {
  formula: Schema.String
})

export const MathOperationCalibratorInfo = Schema.TaggedStruct("MATH_OPERATION", {})

export const CalibratorInfo = Schema.transformOrFail(
  // Source
  Schema.Struct({
    type: Schema.Literal(
      "POLYNOMIAL",
      "SPLINE",
      "MATH_OPERATION",
      "JAVA_EXPRESSION",
      "ALGORITHM"
    ),
    polynomialCalibrator: Schema.optional(PolynomialCalibratorInfo),
    splineCalibrator: Schema.optional(SplineCalibratorInfo),
    javaExpressionCalibrator: Schema.optional(JavaExpressionCalibratorInfo)
  }),
  // Target
  Schema.Union(
    JavaExpressionCalibratorInfo,
    SplineCalibratorInfo,
    PolynomialCalibratorInfo,
    MathOperationCalibratorInfo
  ),
  {
    strict: true,
    decode: (input) => {
      switch (input.type) {
        case "SPLINE":
          return ParseResult.succeed(input.splineCalibrator!)
        case "POLYNOMIAL":
          return ParseResult.succeed(input.polynomialCalibrator!)
        case "JAVA_EXPRESSION":
          return ParseResult.succeed(input.javaExpressionCalibrator!)
        case "MATH_OPERATION":
          return ParseResult.succeed(MathOperationCalibratorInfo.make())
        default:
          return ParseResult.fail(new ParseResult.Unexpected(input.type, "Couldn't decode unknown calibrator"))
      }
    },
    // Encode: Forbid reversing the hashed password back to plain text
    encode: (initial, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          initial,
          "Encoding back into an API response is not supported at this time."
        )
      )
  }
)

export const DataEncodingType = Schema.Literal(
  "BINARY",
  "BOOLEAN",
  "FLOAT",
  "INTEGER",
  "STRING"
)

export const DataEncodingInfo = Schema.Struct({
  type: DataEncodingType,
  littleEndian: Schema.optional(Schema.Boolean),
  sizeInBits: Schema.optional(Schema.NonNegativeInt),
  encoding: Schema.optional(Schema.String),
  defaultCalibrator: Schema.optional(CalibratorInfo)
  // contextCalibrators: Schema.Array(ContextCalibratorInfo)
})

export const ParameterTypeInfo = Schema.Struct({
  name,
  qualifiedName,
  shortDescription,
  longDescription,
  alias,

  // Engineering Type
  engType: Schema.String,
  dataEncoding: Schema.optional(DataEncodingInfo),
  unitSet: Schema.optional(Schema.Array(UnitInfo))
})

export const DataSourceType = Schema.Literal(
  "TELEMETERED",
  "DERIVED",
  "CONSTANT",
  "LOCAL",
  "SYSTEM",
  "COMMAND",
  "COMMAND_HISTORY",
  "EXTERNAL1",
  "EXTERNAL2",
  "EXTERNAL3",
  "GROUND"
)

export const ParameterInfo = Schema.Struct({
  name,
  qualifiedName,
  shortDescription,
  longDescription,
  alias,
  type: ParameterTypeInfo,
  dataSource: DataSourceType
  // usedBy: UsedByInfo
  // ancillaryData: {[key: string]: AncillaryDataInfo},
})

export const HistoryInfo = Schema.Struct({
  version: Schema.String,
  date: Schema.String,
  message: Schema.String,
  author: Schema.String
})

export const SpaceSystemInfo = Schema.Struct({
  name,
  qualifiedName,
  shortDescription,
  longDescription,
  alias,
  version: Schema.optional(Schema.String),
  history: Schema.optional(Schema.Array(HistoryInfo))
  // sub: SpaceSystemInfo[],
  // ancillaryData: {[key: Schema.String]: AncillaryDataInfo},
})

export const MissionDatabase = Schema.Struct({
  configName: Schema.optional(Schema.String),
  name,
  version: Schema.optional(Schema.String),
  spaceSystems: Schema.Array(SpaceSystemInfo),
  parameterCount: Schema.Number,
  containerCount: Schema.Number,
  commandCount: Schema.Number,
  algorithmCount: Schema.Number,
  parameterTypeCount: Schema.Number
})
