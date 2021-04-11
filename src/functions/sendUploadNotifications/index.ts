import { handlerPath } from '@libs/handlerResolver';

export default {
  environment: {
    STAGE: "${self:provider.stage}",
    API_ID: {
      Ref: "WebsocketsApi"
    }
  },
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [{
    sns: {
      arn: {
        "Fn::Join": [
          ":",
          [
            "arn:aws:sns",
            { Ref: "AWS::Region" },
            { Ref: "AWS::AccountId"},
            "ImagesTopic"
          ]
        ]
      },
      topicName: "ImagesTopic"
    }
  }]
}
