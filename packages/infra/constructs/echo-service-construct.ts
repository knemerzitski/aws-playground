import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import path from 'node:path';

export interface EchoServiceConstructProps {
  readonly api: RestApi;
}

export class EchoServiceConstruct extends Construct {
  readonly function: NodejsFunction;
  readonly url: URL;

  constructor(scope: Construct, id: string, props: EchoServiceConstructProps) {
    super(scope, id);

    this.function = new NodejsFunction(this, 'Function', {
      handler: 'index.handler',
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset(path.join(__dirname, '../../echo-service/dist')),
      timeout: Duration.seconds(5),
      memorySize: 128,
      logGroup: new LogGroup(this, 'LogGroup', {
        retention: RetentionDays.ONE_DAY,
      }),
    });

    const resource = props.api.root.addResource('echo');
    resource.addMethod('POST', new LambdaIntegration(this.function));
  }
}
