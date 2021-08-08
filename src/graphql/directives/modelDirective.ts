import { mergeSchemas } from '@graphql-tools/merge'
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'
import pluralize from 'pluralize'

// TODO: implement resolver for connection
// TODO: @key

function getRecord(payload: {
  model: string
  obj: undefined | Record<string, any>
  args: Record<string, any>
  ctx: Record<string, any>
  auth: Record<string, any> | undefined
}): Record<string, any> | null {
  // Apply auth rules, if they exist
  console.log('auth: ', payload.auth)
  // TODO: get the record from ORM
  return { id: 1 }
}

function listRecords(payload: {
  model: string
  obj: undefined | Record<string, any>
  args: Record<string, any>
  ctx: Record<string, any>
  auth: Record<string, any> | undefined
}): { items: Record<string, any>[]; nextToken: string | null } {
  // Apply auth rules, if they exist
  console.log('auth: ', payload.auth)
  // TODO: get the records from ORM
  const items = [{ id: 1 }]
  return { items, nextToken: null }
}

function createRecord(payload: {
  model: string
  obj: undefined | Record<string, any>
  args: Record<string, any>
  ctx: Record<string, any>
  auth: Record<string, any> | undefined
}): Record<string, any> | null {
  // Apply auth rules, if they exist
  console.log('auth: ', payload.auth)
  // TODO: get the records from ORM
  return null
}

function updateRecord(payload: {
  model: string
  obj: undefined | Record<string, any>
  args: Record<string, any>
  ctx: Record<string, any>
  auth: Record<string, any> | undefined
}): Record<string, any> | null {
  // Apply auth rules, if they exist
  console.log('auth: ', payload.auth)
  // TODO: get the records from ORM
  return null
}

function getInputType(type: string) {
  if (type.includes('Int')) return 'ModelIntInput'
  if (type.includes('ID')) return 'ModelIDInput'
  return 'ModelStringInput'
}

export function modelDirectiveTransformer(schema: GraphQLSchema) {
  // TODO: add the claims payload to the info object of the resolver
  const models = new Set()
  const auths = {}
  const fields = {}
  const connectionFields: Record<
    string,
    { fieldName: string; returnType: string }[]
  > = {}

  const newSchema = mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (fieldConfig) => {
      const modelDirective = getDirective(schema, fieldConfig, 'model')
      if (modelDirective) {
        models.add(fieldConfig.name)

        // Save the fields in a Key-Value format.
        fields[fieldConfig.name] = Object.entries(
          fieldConfig.toConfig().fields
        ).reduce((s, kv) => ({ ...s, [kv[0]]: kv[1].type.toString() }), {})
      }
      const authDirective = getDirective(schema, fieldConfig, 'auth')
      if (authDirective) {
        auths[fieldConfig.name] = authDirective[0]
      }
      return fieldConfig
    },
    [MapperKind.FIELD]: (fieldConfig, fieldName, typeName) => {
      const connectionDirective = getDirective(
        schema,
        fieldConfig,
        'connection'
      )
      if (connectionDirective) {
        const type = fieldConfig.astNode.type
        let returnType = ''
        if (type && 'type' in type && 'name' in type.type) {
          returnType = type.type.name.value
        } else if ('name' in type) {
          returnType = type.name.value
        }

        if (returnType) {
          const connFieldsForModel = connectionFields[typeName] || []
          connFieldsForModel.push({ fieldName, returnType })
          connectionFields[typeName] = connFieldsForModel
          return null
        }
      }
      return fieldConfig
    },
  })

  // TODO: define new nodes for the missing types for Subscription
  // - onCreateXXX
  // - onUpdateXXX
  // - onDeleteXXX

  const modelArr = Array.from(models) as string[]

  const t1 = `
    ${modelArr.map((model) => {
      // Extract the fields of the model type from newSchema
      const modelFields = Object.entries(fields[model] || {})
      const fieldTypesString = modelFields.map(
        (item) => item[0] + `:` + getInputType(item[1] as string)
      )
      const connFieldsForModel = connectionFields[model] || []
      const connExtensions =
        connFieldsForModel.length > 0
          ? `type ${model} {
        ${connFieldsForModel.map(
          ({ fieldName, returnType }) => `${fieldName}(
          filter: Model${returnType}FilterInput,
          sortDirection: ModelSortDirection,
          limit: Int,
          nextToken: String
        ): Model${returnType}Connection`
        )}
      }`
          : ''

      return `
        input Model${model}FilterInput {
          ${fieldTypesString}
          and: [Model${model}FilterInput]
          or: [Model${model}FilterInput]
          not: Model${model}FilterInput
        }
        type Model${model}Connection {
          items: [${model}]
          nextToken: String
        }

        input Update${model}Input {
        	${fieldTypesString}
        }

        input Create${model}Input {
        	${fieldTypesString}
        }

        input Model${model}ConditionInput {
          ${fieldTypesString}
          and: [Model${model}ConditionInput]
          or: [Model${model}ConditionInput]
          not: Model${model}ConditionInput
        }

        ${connExtensions}
        
      `
    })}

    input ModelIDInput {
    	ne: ID
    	eq: ID
    	le: ID
    	lt: ID
    	ge: ID
    	gt: ID
    	contains: ID
    	notContains: ID
    	between: [ID]
    	beginsWith: ID
    	attributeExists: Boolean
    	attributeType: ModelAttributeTypes
    	size: ModelSizeInput
    }

    enum ModelSortDirection {
      ASC
      DESC
    }

    input ModelFloatInput {
      ne: Float
      eq: Float
      le: Float
      lt: Float
      ge: Float
      gt: Float
      between: [Float]
      attributeExists: Boolean
      attributeType: ModelAttributeTypes
    }

    input ModelBooleanInput {
      ne: Boolean
      eq: Boolean
      attributeExists: Boolean
      attributeType: ModelAttributeTypes
    }

    input ModelStringInput {
      ne: String
      eq: String
      le: String
      lt: String
      ge: String
      gt: String
      contains: String
      notContains: String
      between: [String]
      beginsWith: String
      attributeExists: Boolean
      attributeType: ModelAttributeTypes
      size: ModelSizeInput
    }

    input ModelSizeInput {
      ne: Int
      eq: Int
      le: Int
      lt: Int
      ge: Int
      gt: Int
      between: [Int]
    }

    enum ModelAttributeTypes {
      binary
      binarySet
      bool
      list
      map
      number
      numberSet
      string
      stringSet
      _null
    }

    type Query {
      ${modelArr.map(
        (model) => `
        get${model}(id: ID!): ${model}
        list${pluralize(
          model
        )}(filter: Model${model}FilterInput, limit: Int, nextToken: String): Model${model}Connection
      `
      )}
    }

    type Mutation {
      ${modelArr.map(
        (model) => `
          create${model}(input: Create${model}Input!, condition: Model${model}ConditionInput): ${model}
          update${model}(input: Update${model}Input!, condition: Model${model}ConditionInput): ${model}
        `
      )}
    }
  `
  const resolvers = {
    Query: modelArr.reduce(
      (s, model) => ({
        ...s,
        [`get${model}`]: (
          obj: undefined,
          args: Record<string, any>,
          ctx: Record<string, any>
        ) => getRecord({ model, obj, args, ctx, auth: auths[model] }),
        [`list${pluralize(model)}`]: (
          obj: undefined,
          args: Record<string, any>,
          ctx: Record<string, any>
        ) => listRecords({ model, obj, args, ctx, auth: auths[model] }),
      }),
      {}
    ),
    Mutation: modelArr.reduce(
      (s, model) => ({
        ...s,
        [`create${model}`]: (
          obj: undefined,
          args: Record<string, any>,
          ctx: Record<string, any>
        ) => createRecord({ model, obj, args, ctx, auth: auths[model] }),
        [`update${pluralize(model)}`]: (
          obj: undefined,
          args: Record<string, any>,
          ctx: Record<string, any>
        ) => updateRecord({ model, obj, args, ctx, auth: auths[model] }),
      }),
      {}
    ),
  }
  return mergeSchemas({ schemas: [newSchema], typeDefs: [t1], resolvers })
}

export const modelDirectiveTypeDefs = /*graphql*/ `
  directive @key(fields: [String!]!, name: String, queryField: String) on OBJECT
  directive @connection(name: String, keyName: String, fields: [String!]) on FIELD_DEFINITION


  directive @model(
    queries: ModelQueryMap
    mutations: ModelMutationMap
    subscriptions: ModelSubscriptionMap
    timestamps: TimestampConfiguration
  ) on OBJECT
  input ModelMutationMap {
    create: String
    update: String
    delete: String
  }
  input ModelQueryMap {
    get: String
    list: String
  }
  input ModelSubscriptionMap {
    onCreate: [String]
    onUpdate: [String]
    onDelete: [String]
    level: ModelSubscriptionLevel
  }
  enum ModelSubscriptionLevel {
    off
    public
    on
  }
  input TimestampConfiguration {
    createdAt: String
    updatedAt: String
  }

  # -----------------
  # When applied to a type, augments the application with
  # owner and group-based authorization rules.
  directive @auth(rules: [AuthRule!]!) on OBJECT | FIELD_DEFINITION
  input AuthRule {
    allow: AuthStrategy!
    provider: AuthProvider
    ownerField: String # defaults to "owner" when using owner auth
    identityClaim: String # defaults to "username" when using owner auth
    groupClaim: String # defaults to "cognito:groups" when using Group auth
    groups: [String]  # Required when using Static Group auth
    groupsField: String # defaults to "groups" when using Dynamic Group auth
    operations: [ModelOperation] # Required for finer control
  }
  enum AuthStrategy { owner groups private public }
  enum AuthProvider { apiKey iam oidc userPools }
  enum ModelOperation { create update delete read }
`
