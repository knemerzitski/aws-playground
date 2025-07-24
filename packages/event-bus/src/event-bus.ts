interface Event<TName extends string, TPayload> {
  type: TName;
  payload: TPayload;
}

type Handler<TName extends string, TPayload> = (
  event: Event<TName, TPayload>
) => Promise<void> | void;

type AnyHandler = Handler<string, unknown>;

type EventMap = object;

export class EventBus<TEventMap extends EventMap> {
  private readonly handlerByEvent = new Map<string, Set<AnyHandler>>();

  private eventQueue: (Event<string, unknown> & {
    resolve: () => void;
    reject: (err: unknown) => void;
  })[] = [];

  private flushScheduled = false;

  subscribe<TName extends keyof TEventMap & string>(
    eventName: TName,
    handler: Handler<TName, TEventMap[TName]>
  ) {
    let handlerSet = this.handlerByEvent.get(eventName);
    if (!handlerSet) {
      handlerSet = new Set();
      this.handlerByEvent.set(eventName, handlerSet);
    }

    handlerSet.add(handler as AnyHandler);

    return () => {
      this.unsubscribe(eventName, handler);
    };
  }

  unsubscribe<TName extends keyof TEventMap & string>(
    eventName: TName,
    handler: Handler<TName, TEventMap[TName]>
  ) {
    const handlerSet = this.handlerByEvent.get(eventName);
    if (!handlerSet) {
      return;
    }

    handlerSet.delete(handler as AnyHandler);
  }

  publish<TName extends keyof TEventMap & string>(
    eventName: TName,
    ...args: TEventMap[TName] extends undefined ? [] : [payload: TEventMap[TName]]
  ): Promise<void>;
  publish(eventName: string, payload?: unknown): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.eventQueue.push({
        type: eventName,
        payload,
        resolve,
        reject,
      });

      if (!this.flushScheduled) {
        this.flushScheduled = true;
        queueMicrotask(() => {
          void this.flush();
        });
      }
    });
  }

  private async flush() {
    this.flushScheduled = false;

    const queue = this.eventQueue;
    this.eventQueue = [];

    for (const { type, payload, resolve, reject } of queue) {
      const handlerSet = this.handlerByEvent.get(type);
      if (!handlerSet) {
        resolve();
        continue;
      }

      const handlers = [...handlerSet];

      const event: Event<string, unknown> = {
        type,
        payload,
      };

      try {
        await Promise.all(handlers.map((handler) => handler(event)));
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  }
}
