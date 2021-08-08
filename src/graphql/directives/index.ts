import compose from 'compose-function'
import * as mDirective from './modelDirective'
import * as bangDirective from './bangDirective'

export const typeDefs = [mDirective.typeDefs, bangDirective.typeDefs]

export const transform = compose(mDirective.transform, bangDirective.transform)
