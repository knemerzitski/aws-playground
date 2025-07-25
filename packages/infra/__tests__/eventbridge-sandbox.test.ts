import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { beforeAll, expect, it } from 'vitest';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';

const REGION = 'eu-central-1';
const STACK_NAME = 'TestEventBridgeStack';

async function getCfnOutput(stackName: string, outputKey: string) {
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
let client: EventBridgeClient;
let logs: CloudWatchLogsClient;

let lambdaLogGroup: string;

beforeAll(async () => {
  cf = new CloudFormationClient({
    region: REGION,
  });

  client = new EventBridgeClient({
    region: REGION,
  });

  logs = new CloudWatchLogsClient({
    region: REGION,
  });

  console.time('cdkOutput');
  lambdaLogGroup = await getCfnOutput(STACK_NAME, 'LambdaLogGroup');
  console.timeEnd('cdkOutput');
});

it('should publish event and trigger lambda', async () => {
  console.time('put');
  const putResult = await client.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: 'my.app',
          DetailType: 'MyEvent',
          Detail: JSON.stringify({
            message: 'from test',
          }),
        },
      ],
    })
  );
  console.timeEnd('put');

  await new Promise((r) => setTimeout(r, 4000));

  console.time('logs');
  const logsResult = await logs.send(
    new FilterLogEventsCommand({
      logGroupName: lambdaLogGroup,
      filterPattern: 'from test',
      startTime: Date.now() - 60_000,
    })
  );
  console.timeEnd('logs');

  const found = logsResult.events?.some((e) => e.message?.includes('from test'));

  console.log({
    putResult,
    logsResult,
  });

  expect(found).toBe(true);
}, {
  timeout: 20000
});
