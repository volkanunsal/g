import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import resolvers from './graphql/resolvers'
import { transform, typeDefs } from './graphql/directives'
import { makeExecutableSchema } from '@graphql-tools/schema'
import fs from 'fs'

const typeDefsFromFile = fs.readFileSync(
  __dirname + '/graphql/schema.graphql',
  'utf-8'
)

const schema = transform(
  makeExecutableSchema({
    typeDefs: typeDefs.concat(typeDefsFromFile),
    resolvers,
  })
)

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
)

app.listen(3000, () => {
  const url = 'http://localhost:3000/graphql'
  console.info(`Listening on ${url}`)
})
