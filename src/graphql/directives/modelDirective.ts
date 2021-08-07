import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'

const directiveName = 'model'

export function modelDirectiveTransformer(schema: GraphQLSchema) {
  let addBaseTypes = false
  let baseTypeRoot: string | undefined
  const newSchema = mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)
      if (directive) {
        addBaseTypes = true
        const config = fieldConfig.toConfig()
        baseTypeRoot = config.name
      }
      return fieldConfig
    },
  })

  return newSchema
}

export const modelDirectiveTypeDefs = `
  directive @model(
    defaultMethods: [String] = ["update", "create", "read", "delete"]
  ) on OBJECT
`
