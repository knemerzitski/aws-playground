import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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
      code: Code.fromAsset(path.join(__dirname, '../../echo/dist/index')),
      timeout: Duration.seconds(5),
      memorySize: 128,
    });

    const resource = props.api.root.addResource('echo')
    resource.addMethod('POST', new LambdaIntegration(this.function));
  }
}
