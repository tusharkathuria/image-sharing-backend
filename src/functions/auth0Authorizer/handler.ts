import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { middyfy } from '@libs/lambda';
import { secretsManager } from 'middy/middlewares'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

export const main = middyfy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    verifyToken(event.authorizationToken)
    console.log('User was authorized')

    return {
      principalId: "user",
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

function verifyToken(authHeader: string) {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  if(token !== "123") {
    throw new Error("Invalid token")
  }
}