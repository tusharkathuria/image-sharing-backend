import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTIONS_TABLE

const wsDisconnect: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const connectionId = event.requestContext.connectionId

  const key = {
    id: connectionId
  }

  await docClient.delete({
    TableName: connectionsTable,
    Key: key
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}

export const main = middyfy(wsDisconnect);