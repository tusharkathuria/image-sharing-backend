import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()
const imagesTable = process.env.IMAGES_TABLE
const imagesIdIndex = process.env.IMAGE_ID_INDEX

const getImage: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const imageId = event.pathParameters.imageId

  const result = await docClient.query({
    TableName: imagesTable,
    IndexName: imagesIdIndex,
    KeyConditionExpression: "imageId = :imageId",
    ExpressionAttributeValues: {
      ":imageId": imageId
    }
  }).promise()

  if(result.Count != 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items[0])
    }
  }

  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': "*"
    },
    body: JSON.stringify({
      message: "Image with id not found"
    })
  }
}

export const main = middyfy(getImage);
