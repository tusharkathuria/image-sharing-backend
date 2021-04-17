import * as middy from "middy"
import {jsonBodyParser, cors} from "middy/middlewares"

export const middyfy = (handler) => {
  return middy(handler)
    .use(jsonBodyParser())
    .use(cors({
      credentials: true
    }))
}
