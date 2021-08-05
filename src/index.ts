import * as express from 'express'
import { graphqlHTTP } from 'express-graphql'
import resolvers from './graphql/resolvers'
import { transform } from './graphql/directives'
import { exec } from 'child_process'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import { loadSchemaSync } from '@graphql-tools/load'

const schema = loadSchemaSync(__dirname + '/graphql/schema.graphql', {
  loaders: [new GraphQLFileLoader()],
})

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
})

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema: transform(schemaWithResolvers),
    graphiql: true,
  })
)

app.listen(3000, () => {
  const url = 'http://localhost:3000/graphql'
  console.info(`Listening on ${url}`)
  exec(`open '${url}'`)
})
