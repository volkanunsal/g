import * as express from 'express'
import { graphqlHTTP } from 'express-graphql'
import typeDefs from './graphql/types'
import resolvers from './graphql/resolvers'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { exec } from "child_process";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

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
  exec(`open '${url}'`)  
})
