import { CfnResource, Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import path from 'node:path';
import { AppConfig } from '../config';

export interface EchoServiceConstructProps {
  readonly config: Pick<AppConfig, 'watch'>;
  readonly api: RestApi | null;
}

export class EchoServiceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EchoServiceConstructProps) {
    super(scope, id);

    const handler = 'index.handler';
    const runtime: Runtime = Runtime.NODEJS_22_X;
    const codePath = path.join(__dirname, '../../echo-service/dist');
    const method = 'post';
    const methodPath = 'echo';

    if (!props.config.watch) {
      if (!props.api) {
        throw new Error('Missing api');
      }

      const fn = new NodejsFunction(this, 'Function', {
        handler,
        runtime,
        code: Code.fromAsset(codePath),
        timeout: Duration.seconds(5),
        memorySize: 128,
        logGroup: new LogGroup(this, 'LogGroup', {
          retention: RetentionDays.ONE_DAY,
        }),
      });

      const resource = props.api.root.addResource(methodPath);
      resource.addMethod(method, new LambdaIntegration(fn));
    } else {
      new CfnResource(this, 'SamFunction', {
        type: 'AWS::Serverless::Function',
        properties: {
          Handler: handler,
          Runtime: runtime.name,
          CodeUri: codePath,
          Events: {
            ApiEvent: {
              Type: 'Api',
              Properties: {
                Method: method,
                Path: `/${methodPath}`,
              },
            },
          },
        },
      });
    }
  }
}
