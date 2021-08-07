import { GraphQLSchema } from 'graphql'

export function modelDirectiveTransformer(schema: GraphQLSchema) {
  return schema
}

export const modelDirectiveTypeDefs = `
  directive @model(
    defaultMethods: [String] = ["update", "create", "read", "delete"]
  ) on OBJECT
`
