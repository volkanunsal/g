import { mapSchema } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'

export function modelDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {})
}

export const modelDirectiveTypeDefs = `directive @model(
  defaultMethods: [String] = ["update", "create", "read", "delete"]
) on FIELD_DEFINITION
`
