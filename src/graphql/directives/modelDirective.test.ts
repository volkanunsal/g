jest.mock('../../orm');
import { makeExecutableSchema } from '@graphql-tools/schema';
import { removeLoc } from '@graphql-tools/optimize';
import { transform, typeDefs } from './modelDirective';
import {
  GraphQLObjectType,
  GraphQLSchema,
  ObjectTypeDefinitionNode,
} from 'graphql';
import * as orm from '../../orm';

describe('modelDirective', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getSchema(typeDefsFromFile = '', resolvers = {}) {
    return transform(
      makeExecutableSchema({
        typeDefs: typeDefs.concat(typeDefsFromFile),
        resolvers,
      })
    );
  }

  function removeLocAny<T>(ast: T): T {
    return removeLoc(ast as any) as any;
  }

  const getTypeAST = (schema: GraphQLSchema, prop: string) =>
    removeLocAny(schema.getTypeMap()[prop].astNode as ObjectTypeDefinitionNode);

  describe('@model', () => {
    const schema = getSchema(`
      type Project @model {
        id: ID
        name: String
      }
    `);

    describe('root queries', () => {
      const ast = getTypeAST(schema, 'Query');

      it('adds: listProjects', () => {
        expect(ast.fields[1]).toMatchSnapshot();
        expect(ast.fields[1]).toHaveProperty('name.value', 'listProjects');
      });

      it('adds: getProject', () => {
        expect(ast.fields[0]).toMatchSnapshot();
        expect(ast.fields[0]).toHaveProperty('name.value', 'getProject');
      });
    });

    describe('root mutations', () => {
      const ast = getTypeAST(schema, 'Mutation');

      it('adds: createProject', () => {
        expect(ast.fields[0]).toMatchSnapshot();
        expect(ast.fields[0]).toHaveProperty('name.value', 'createProject');
      });

      it('adds: updateProject', () => {
        expect(ast.fields[1]).toMatchSnapshot();
        expect(ast.fields[1]).toHaveProperty('name.value', 'updateProject');
      });

      it('adds: deleteProject', () => {
        expect(ast.fields[2]).toMatchSnapshot();
        expect(ast.fields[2]).toHaveProperty('name.value', 'deleteProject');
      });
    });

    describe('adds: model types', () => {
      it('adds: ModelProjectFilterInput', () => {
        expect(schema.getTypeMap()).toHaveProperty(
          'ModelProjectFilterInput.name',
          'ModelProjectFilterInput'
        );
      });

      it('adds: ModelProjectConnection', () => {
        expect(schema.getTypeMap()).toHaveProperty(
          'ModelProjectConnection.name',
          'ModelProjectConnection'
        );
      });

      it('adds: ModelProjectConditionInput', () => {
        expect(schema.getTypeMap()).toHaveProperty(
          'ModelProjectConditionInput.name',
          'ModelProjectConditionInput'
        );
      });
    });
  });

  describe('@auth', () => {
    const schema = getSchema(`
      type Project @model @auth(rules: [{ allow: owner }]) {
        id: ID
        name: String
      }
    `);

    const obj = undefined;
    const args = { a: 1 };
    const ctx = { some: 'thing' };
    const info = { foo: 'bar' } as any;
    const auth = { rules: [{ allow: 'owner' }] };

    function invokeQueryFieldResolver(field: string) {
      // Invoke the resolver
      (schema.getTypeMap().Query as GraphQLObjectType)
        .getFields()
        [field].resolve(obj, args, ctx, info);
    }

    function invokeMutationFieldResolver(field: string) {
      // Invoke the resolver
      (schema.getTypeMap().Mutation as GraphQLObjectType)
        .getFields()
        [field].resolve(obj, args, ctx, info);
    }

    describe('get: ', () => {
      it('passes auth object to orm', () => {
        invokeQueryFieldResolver('getProject');
        expect(orm.getRecord).toHaveBeenCalledWith(
          expect.objectContaining({ auth })
        );
      });
    });

    describe('list: ', () => {
      it('passes auth object to orm', () => {
        invokeQueryFieldResolver('listProjects');
        expect(orm.listRecords).toHaveBeenCalledWith(
          expect.objectContaining({ auth })
        );
      });
    });

    describe('create: ', () => {
      it('passes auth object to orm', () => {
        invokeMutationFieldResolver('createProject');
        expect(orm.createRecord).toHaveBeenCalledWith(
          expect.objectContaining({ auth })
        );
      });
    });

    describe('update: ', () => {
      it('passes auth object to orm', () => {
        invokeMutationFieldResolver('updateProject');
        expect(orm.updateRecord).toHaveBeenCalledWith(
          expect.objectContaining({ auth })
        );
      });
    });

    describe('delete: ', () => {
      it('passes auth object to orm', () => {
        invokeMutationFieldResolver('deleteProject');
        expect(orm.deleteRecord).toHaveBeenCalledWith(
          expect.objectContaining({ auth })
        );
      });
    });
  });

  describe('@connection', () => {
    // const schema = getSchema(`
    //   type Resource @model {
    //     id: ID
    //   }
    //
    //   type Project @model {
    //     id: ID
    //     name: String
    //     resource: Resource @connection
    //     resources: [Resource] @connection
    //   }
    // `);

    describe('list type', () => {
      it.todo('adds edge type to the connected field');
      it.todo('adds resolver');
    });

    describe('singular type', () => {
      it.todo('does not add edge type to the connected field');
      it.todo('adds resolver');
    });
  });
});
