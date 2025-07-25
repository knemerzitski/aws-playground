import { Construct } from 'constructs';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';

import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import path from 'node:path';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TestEventBridgeStackProps extends StackProps {}

export class TestEventBridgeStack extends Stack {
  constructor(scope: Construct, id: string, props: TestEventBridgeStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'LogGroup', {
      retention: RetentionDays.ONE_DAY,
    });

    const eventHandler = new NodejsFunction(this, 'Function', {
      entry: path.join(__dirname, '../lambda/eventbridge/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(5),
      memorySize: 128,
      logGroup,
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
        format: OutputFormat.ESM,
        dockerImage: Runtime.NODEJS_22_X.bundlingImage,
      },
    });

    const rule = new Rule(this, 'EventRule', {
      eventPattern: {
        source: ['my.app'],
        detailType: ['MyEvent'],
      },
    });

    rule.addTarget(new LambdaFunction(eventHandler));

    new CfnOutput(this, 'LambdaLogGroup', {
      value: logGroup.logGroupName,
    });
  }
}
