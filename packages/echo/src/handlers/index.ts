import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = function (
  event,
  _context,
  _callback
) {
  console.log('Processing event', event);

  return Promise.resolve({
    statusCode: 200,
    body: 'TODO echo back body',
  });
};
