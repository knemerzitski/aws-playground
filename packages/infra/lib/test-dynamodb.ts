import { Construct } from 'constructs';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TestDynamoDBStackProps extends StackProps {}

export class TestDynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props: TestDynamoDBStackProps) {
    super(scope, id, props);

    const table = new Table(this, 'TestTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new CfnOutput(this, 'DynamoTableName', {
      value: table.tableName,
    });
  }
}
