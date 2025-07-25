import { EventBridgeHandler } from 'aws-lambda';

interface MyEventDetail {
  message: string;
}

export const handler: EventBridgeHandler<'MyEvent', MyEventDetail, void> = (event) => {
  console.log('Received EventBridge event:', JSON.stringify(event, null, 2));

  console.log('Detail', event.detail);
  console.log('Message', event.detail.message);
};
