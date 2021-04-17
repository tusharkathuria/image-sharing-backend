import * as middy from "middy"
import {jsonBodyParser} from "middy/middlewares"

export const middyfy = (handler) => {
  return middy(handler).use(jsonBodyParser())
}
