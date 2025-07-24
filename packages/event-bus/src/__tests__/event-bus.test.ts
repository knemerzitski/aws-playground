import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../event-bus';

interface Events {
  foo: string;
  bar: undefined;
  obj: {
    message: string;
  };
}

it('should publish events in microtask queue', async () => {
  const eventBus = new EventBus<Events>();

  const handlerSpy = vi.fn();

  eventBus.subscribe('obj', handlerSpy);

  void eventBus.publish('obj', {
    message: '2',
  });
  void eventBus.publish('obj', {
    message: '3',
  });
  handlerSpy('1');

  await new Promise(process.nextTick.bind(process));

  expect(handlerSpy.mock.calls).toStrictEqual([
    ['1'],
    [
      {
        type: 'obj',
        payload: {
          message: '2',
        },
      },
    ],
    [
      {
        type: 'obj',
        payload: {
          message: '3',
        },
      },
    ],
  ]);
});

it('should allow event without payload', () => {
  const eventBus = new EventBus<Events>();

  void eventBus.publish('foo', 'payload');
  void eventBus.publish('bar');
});

describe('subscribe', () => {
  it('should return unsubscribe callbable', async () => {
    const eventBus = new EventBus<Events>();

    const handlerSpy = vi.fn();

    const unsub = eventBus.subscribe('foo', handlerSpy);
    unsub();

    await eventBus.publish('foo', 'never');

    expect(handlerSpy.mock.calls).toStrictEqual([]);
  });
});
