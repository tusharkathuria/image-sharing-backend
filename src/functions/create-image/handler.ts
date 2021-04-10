import 'source-map-support/register';
import * as AWS from 'aws-sdk'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { uuid } from 'uuidv4';
import { middyfy } from '@libs/lambda';
const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({signatureVersion: "v4"})
const imagesTable = process.env.IMAGES_TABLE
const groupsTable = process.env.GROUPS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

import schema from './schema';

const createImage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log("Processing event: ", event)

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

    const itemId = uuid();
    const newItem = {
        timestamp: new Date().toISOString(),
        imageId: itemId,
        groupId: groupId,
        ...event.body,
        imageUrl: `http://${bucketName}.s3.amazonaws.com/${itemId}`
    }

    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise()

    const url = getUploadUrl(itemId)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': "*"
        },
        body: JSON.stringify({
            newItem,
            uploadUrl: url
        })
    };
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

function getUploadUrl(imageId: String) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: parseInt(urlExpiration)
    })
}

export const main = middyfy(createImage);