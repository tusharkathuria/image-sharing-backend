import 'source-map-support/register';
import * as AWS from 'aws-sdk'
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

const getImages: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  if(!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': "*"
      },
      body: JSON.stringify({
        error: 'Group does not exists'
      })
    }
  }

  const images = await getImagesPerGroup(groupId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': "*"
    },
    body: JSON.stringify({
      items: images
    })
  }
}

async function groupExists(groupId: String) {
  const result = await docClient.get({
    TableName: groupsTable,
    Key: {
      id: groupId
    }
  }).promise()

  console.log("Get group: ", result)
  return !!result.Item
}

async function getImagesPerGroup(groupId: String) {
  const result = await docClient.query({
    TableName: imagesTable,
    KeyConditionExpression: "groupId = :groupId",
    ExpressionAttributeValues: {
      ":groupId": groupId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}

export const main = middyfy(getImages);
