import type { AWS } from '@serverless/typescript';
import createGroup from '@functions/create-group';
import getGroups from "@functions/get-groups"
import getImages from "@functions/get-images"
import getImage from "@functions/get-image"
import createImage from "@functions/create-image"

const serverlessConfiguration: AWS = {
  service: 'serverless-udagram-app',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: "ap-south-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      GROUPS_TABLE: "Groups-${self:provider.stage}",
      IMAGES_TABLE: "Images-${self:provider.stage}",
      IMAGE_ID_INDEX: "ImageIdIndex",
      IMAGES_S3_BUCKET: "629226848507-serverless-image-group-app-images-${self:provider.stage}",
      SIGNED_URL_EXPIRATION: "300"
    },
    iamRoleStatements: [{
      Effect: "Allow",
      Action: ["dynamodb:Scan", "dynamodb:PutItem", "dynamodb:GetItem"],
      Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}"
    }, {
      Effect: "Allow",
      Action: ["dynamodb:Query", "dynamodb:PutItem"],
      Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}"
    }, {
      Effect: "Allow",
      Action: ["dynamodb:Query"],
      Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}/index/${self:provider.environment.IMAGE_ID_INDEX}"
    }, {
      Effect: "Allow",
      Action: ["s3:PutObject", "s3:GetObject"],
      Resource: "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"
    }],
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { getGroups, createGroup, getImages, getImage, createImage },
  resources: {
    Resources: {
      GroupsDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S"
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"
          }],
          BillingMode: "PAY_PER_REQUEST",
          TableName: "${self:provider.environment.GROUPS_TABLE}"
        }
      },
      ImagesDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [{
            AttributeName: "groupId",
            AttributeType: "S"
          }, {
            AttributeName: "timestamp",
            AttributeType: "S"
          }, {
            AttributeName: "imageId",
            AttributeType: "S"
          }],
          KeySchema: [{
            AttributeName: "groupId",
            KeyType: "HASH"
          }, {
            AttributeName: "timestamp",
            KeyType: "RANGE"
          }],
          GlobalSecondaryIndexes: [{
            IndexName: "${self:provider.environment.IMAGE_ID_INDEX}",
            KeySchema: [{
              AttributeName: "imageId",
              KeyType: "HASH"
            }],
            Projection: {
              ProjectionType: "ALL"
            }
          }],
          BillingMode: "PAY_PER_REQUEST",
          TableName: "${self:provider.environment.IMAGES_TABLE}"
        }
      },
      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.IMAGES_S3_BUCKET}",
          CorsConfiguration: {
            CorsRules: [{
              AllowedOrigins: ["*"],
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "POST", "PUT", "DELETE", "HEAD"],
              MaxAge: 3000
            }]
          }
        }
      },
      BucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          PolicyDocument: {
            Id: "PublicRead",
            Version: "2012-10-17",
            Statement: [{
              Sid: "PublicReadForGetBucketObjects",
              Effect: "Allow",
              Principal: "*",
              Action: "s3:GetObject",
              Resource: "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"
            }]
          },
          Bucket: "${self:provider.environment.IMAGES_S3_BUCKET}"
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
