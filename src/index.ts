import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import resolvers from './graphql/resolvers'
import { transform, typeDefs } from './graphql/directives'
import { makeExecutableSchema } from '@graphql-tools/schema'
import fs from 'fs'
// import { exec } from 'child_process'
// import { parse, DocumentNode } from 'graphql'

const typeDefsFromFile = fs.readFileSync(
  __dirname + '/graphql/schema.graphql',
  'utf-8'
)

// function completeMissingTypes(docNode: DocumentNode) {
//   // TODO: traverse through the document node
//   // TODO: find the types with the "model" directive
//   // TODO: define new nodes for the missing types
//   // TODO: generate executable schema ast from document ast
//   // TODO: run printSchema and write the output to the file
//   return docNode
// }

const schema = transform(
  makeExecutableSchema({
    typeDefs: typeDefs.concat(typeDefsFromFile),
    resolvers,
  })
)

console.log(JSON.stringify(schema.toConfig(), null, 2))

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
  // exec(`open '${url}'`)
})
