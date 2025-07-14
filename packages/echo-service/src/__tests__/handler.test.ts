import { expect, it } from 'vitest';
import { handler as _handler } from '../handler';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
} from 'aws-lambda';

it('returns same body', async () => {
  const res = await handler({
    body: 'foo bar',
  });

  expect(res.body).toStrictEqual('foo bar');
});

function handler(event: Partial<APIGatewayProxyEvent>) {
  const result = _handler(
    event as APIGatewayProxyEvent,
    {} as Context,
    undefined as unknown as Callback<APIGatewayProxyResult>
  );

  if (result === undefined) {
    throw new Error('Unexpected result is not a promise');
  }

  return result;
}
