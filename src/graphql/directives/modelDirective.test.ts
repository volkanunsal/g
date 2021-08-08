import { makeExecutableSchema } from '@graphql-tools/schema'
import { removeLoc } from '@graphql-tools/optimize'
import { transform, typeDefs } from './modelDirective'
import { GraphQLSchema, ObjectTypeDefinitionNode } from 'graphql'

describe('modelDirective', () => {
  function getSchema(typeDefsFromFile = '', resolvers = {}) {
    return transform(
      makeExecutableSchema({
        typeDefs: typeDefs.concat(typeDefsFromFile),
        resolvers,
      })
    )
  }

  function removeLocAny<T>(ast: T): T {
    return removeLoc(ast as any) as any
  }

  describe('@model', () => {
    let schema = getSchema(`
      type Project @model {
        id: ID
        name: String
      }
    `)

    describe('root queries', () => {
      const getQueryAST = (schema: GraphQLSchema) =>
        removeLocAny(
          schema.getTypeMap().Query.astNode as ObjectTypeDefinitionNode
        )

      const ast = getQueryAST(schema)

      it('adds: listProjects', () => {
        expect(ast.fields[1]).toMatchSnapshot()
        expect(ast.fields[1]).toHaveProperty('name.value', 'listProjects')
      })

      it('adds: getProject', () => {
        expect(ast.fields[0]).toMatchSnapshot()
        expect(ast.fields[0]).toHaveProperty('name.value', 'getProject')
      })
    })

    describe('root mutations', () => {
      const getMutationAST = (schema: GraphQLSchema) =>
        removeLocAny(
          schema.getTypeMap().Mutation.astNode as ObjectTypeDefinitionNode
        )

      const ast = getMutationAST(schema)

      it('adds: createProject', () => {
        expect(ast.fields[0]).toMatchSnapshot()
        expect(ast.fields[0]).toHaveProperty('name.value', 'createProject')
      })

      it('adds: updateProject', () => {
        expect(ast.fields[1]).toMatchSnapshot()
        expect(ast.fields[1]).toHaveProperty('name.value', 'updateProject')
      })

      it('adds: deleteProject', () => {
        expect(ast.fields[2]).toMatchSnapshot()
        expect(ast.fields[2]).toHaveProperty('name.value', 'deleteProject')
      })
    })

    describe('adds: model types', () => {
      it('adds: ModelProjectFilterInput', () => {
        expect(schema.getTypeMap()).toHaveProperty(
          'ModelProjectFilterInput.name',
          'ModelProjectFilterInput'
        )
      })

      it('adds: ModelProjectConnection', () => {
        expect(schema.getTypeMap()).toHaveProperty(
          'ModelProjectConnection.name',
          'ModelProjectConnection'
        )
      })

      it('adds: ModelProjectConditionInput', () => {
        expect(schema.getTypeMap()).toHaveProperty(
          'ModelProjectConditionInput.name',
          'ModelProjectConditionInput'
        )
      })
    })
  })

  describe('@auth', () => {
    it.todo('works')
  })

  describe('@connection', () => {
    it.todo('works')
  })

  // TODO: test resolvers
})
