import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = function (event, _context, _callback) {
  console.log('Echo event', event);

  return Promise.resolve({
    statusCode: 200,
    body: event.body ?? '',
  });
};
