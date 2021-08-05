import { compose } from "compose-function";
import { modelDirectiveTransformer, modelDirectiveTypeDefs } from "./modelDirective";

export const typeDefs = [modelDirectiveTypeDefs]

export const transform = compose(modelDirectiveTransformer)