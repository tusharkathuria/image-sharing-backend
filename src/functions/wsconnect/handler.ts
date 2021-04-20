import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTIONS_TABLE

const wsConnect: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const connectionId = event.requestContext.connectionId
  const timestamp = new Date().toISOString()

  const item = {
    id: connectionId,
    timestamp
  }

  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}

export const main = middyfy(wsConnect);