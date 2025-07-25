import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { beforeAll, expect, it } from 'vitest';

const REGION = 'eu-central-1';
const STACK_NAME = 'TestDynamoDBStack';
const TABLE_OUTPUT_KEY = 'DynamoTableName';

async function getTableNameFromOutput(stackName: string, outputKey: string) {
  const res = await cf.send(
    new DescribeStacksCommand({
      StackName: stackName,
    })
  );
  const outputs = res.Stacks?.[0]?.Outputs ?? [];
  const tableName = outputs.find((o) => o.OutputKey === outputKey)?.OutputValue;
  if (!tableName) {
    throw new Error(`Output ${outputKey} not found in stack ${stackName}`);
  }
  return tableName;
}

let cf: CloudFormationClient;
let client: DynamoDBClient;
let tableName: string;

beforeAll(async () => {
  cf = new CloudFormationClient({
    region: REGION,
  });

  client = new DynamoDBClient({
    region: REGION,
  });

  console.time('cdkOutput');
  tableName = await getTableNameFromOutput(STACK_NAME, TABLE_OUTPUT_KEY);
  console.timeEnd('cdkOutput');
});

it('should put and get item from DynamoDB', async () => {
  console.time('put');
  const putResult = await client.send(
    new PutItemCommand({
      TableName: tableName,
      Item: {
        id: {
          S: 'test-id',
        },
        value: {
          S: 'hello',
        },
      },
    })
  );
  console.timeEnd('put');

  console.time('get');
  const getResult = await client.send(
    new GetItemCommand({
      TableName: tableName,
      Key: {
        id: { S: 'test-id' },
      },
    })
  );
  console.timeEnd('get');

  console.log({
    putResult,
    getResult,
  });
  expect(getResult.Item?.value?.S).toBe('hello');
});
