import compose from 'compose-function'
import {
  modelDirectiveTransformer,
  modelDirectiveTypeDefs,
} from './modelDirective'
import {
  bangDirectiveTransformer,
  bangDirectiveTypeDefs,
} from './bangDirective'

export const typeDefs = [modelDirectiveTypeDefs, bangDirectiveTypeDefs]

export const transform = compose(
  modelDirectiveTransformer,
  bangDirectiveTransformer
)
