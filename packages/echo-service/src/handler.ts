import { identityFn } from '@repo/utils';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = function (event, _context, _callback) {
  console.log('Echo event', event);

  const body = identityFn(event.body) ?? '';

  return Promise.resolve({
    statusCode: 200,
    body,
  });
};
