jest.mock('../../orm');
import { makeExecutableSchema } from '@graphql-tools/schema';
import { removeLoc } from '@graphql-tools/optimize';
import { transform, typeDefs } from './modelDirective';
import {
  GraphQLObjectType,
  GraphQLSchema,
  ObjectTypeDefinitionNode,
} from 'graphql';
import { getRecord } from '../../orm';

describe('modelDirective', () => {
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
    it('passes auth object to orm', () => {
      const obj = undefined;
      const args = { a: 1 };
      const ctx = { some: 'thing' };
      const info = { foo: 'bar' } as any;
      // Invoke the resolver
      (schema.getTypeMap().Query as GraphQLObjectType)
        .getFields()
        .getProject.resolve(obj, args, ctx, info);

      // Verify the ORM method has been invoked with `auth` object
      const auth = { rules: [{ allow: 'owner' }] };
      expect(getRecord).toHaveBeenCalledWith(expect.objectContaining({ auth }));
    });
  });

  describe('@connection', () => {
    it.todo('works');
  });

  // TODO: test resolvers
});
