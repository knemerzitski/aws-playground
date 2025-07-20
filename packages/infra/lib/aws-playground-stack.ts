import { Construct } from 'constructs';
import { EchoServiceConstruct } from '../constructs/echo-service-construct';
import { Cors, EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AppConfig } from '../config';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AwsPlaygroundStackProps extends StackProps {
  config: AppConfig;
}

export class AwsPlaygroundStack extends Stack {
  constructor(scope: Construct, id: string, props: AwsPlaygroundStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'InfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const api = !props.config.watch
      ? new RestApi(this, 'Api', {
          restApiName: 'AWS Playground API',
          description: 'Central api for playground services',
          endpointTypes: [EndpointType.REGIONAL],
          deployOptions: {
            stageName: 'playground',
            throttlingBurstLimit: 20,
            throttlingRateLimit: 50,
          },
          deploy: true,
          defaultCorsPreflightOptions: {
            allowMethods: ['GET', 'POST', 'OPTIONS'],
            allowOrigins: Cors.ALL_ORIGINS,
          },
        })
      : null;

    new EchoServiceConstruct(this, 'EchoService', {
      api,
      config: props.config,
    });

    if (api) {
      new CfnOutput(this, 'ApiGatewayUrl', {
        value: api.url,
        description: 'The URL of the API Gateway endpoint',
      });
    }
  }
}
