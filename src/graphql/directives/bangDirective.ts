import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'

const directiveName = 'bang'

export function bangDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)
      if ('resolve' in fieldConfig && directive) {
        const resolve = fieldConfig.resolve
        fieldConfig.resolve = (...args) => {
          return resolve(...args) + '!!!'
        }
      }
      return fieldConfig
    },
  })
}

export const bangDirectiveTypeDefs = `
  directive @bang on FIELD_DEFINITION
`
