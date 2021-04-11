import * as AWS from 'aws-sdk'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { uuid } from 'uuidv4';
import { middyfy } from '@libs/lambda';
const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

import schema from './schema';

const createGroup: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log("Processing event: ", event)

    const itemId = uuid();
    const newItem = {
        id: itemId,
        ...event.body
    }

    await docClient.put({
        TableName: groupsTable,
        Item: newItem
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': "*"
        },
        body: JSON.stringify({newItem})
    };
}

export const main = middyfy(createGroup);