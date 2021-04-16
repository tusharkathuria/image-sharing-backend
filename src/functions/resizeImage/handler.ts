import { SNSHandler, SNSEvent, S3EventRecord } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { middyfy } from '@libs/lambda';
import Jimp from 'jimp/es'

const s3 = new AWS.S3()
const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

const resizeImage: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      // "record" is an instance of S3EventRecord
      await processImage(record) // A function that should resize each image
    }
  }
}

async function processImage(record: S3EventRecord) {
  const key = record.s3.object.key

  console.log('Processing S3 item with key: ', key)

  const response = await s3
    .getObject({
      Bucket: imagesBucketName,
      Key: key
    })
    .promise()

  const body = response.Body
  const image = await Jimp.read(body)

  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

  console.log(`Writing image back to S3 bucket: ${thumbnailBucketName}`)
  await s3
    .putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    })
    .promise()
}

export const main = middyfy(resizeImage);