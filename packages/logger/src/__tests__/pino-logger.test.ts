import { PassThrough } from 'node:stream';

import pino from 'pino';
import { assert, beforeEach, expect, it } from 'vitest';

import { PinoLogger } from '../pino-logger';

function createCapturingLogger(logs: string[]) {
  const stream = new PassThrough();
  stream.setEncoding('utf8');
  stream.on('data', (data) => {
    logs.push(data);
  });

  return new PinoLogger(
    pino(
      {
        level: 'trace',
      },
      stream
    )
  );
}

function flushEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

let logs: string[];
let logger: PinoLogger;

beforeEach(() => {
  logs = [];
  logger = createCapturingLogger(logs);
});

const cases = [
  { method: 'fatal', level: 60, msg: 'fatal test' },
  { method: 'error', level: 50, msg: 'error test' },
  { method: 'warn', level: 40, msg: 'warn test' },
  { method: 'info', level: 30, msg: 'info test' },
  { method: 'debug', level: 20, msg: 'debug test' },
  { method: 'trace', level: 10, msg: 'trace test' },
] as const;

for (const { method, level, msg } of cases) {
  it(`should log correctly using ${method}()`, async () => {
    logger[method](msg);

    await flushEventLoop();

    assert(typeof logs[0] !== 'undefined');
    const parsed = JSON.parse(logs[0]);

    expect(parsed.level).toBe(level);
    expect(parsed.msg).toBe(msg);
  });
}

it('should log an error instance with stack trace', async () => {
  const err = new Error('something went wrong');
  logger.error(err);

  await flushEventLoop();

  assert(typeof logs[0] !== 'undefined');
  const parsed = JSON.parse(logs[0]);

  expect(parsed.level).toBe(50);
  expect(parsed.err.type).toBe('Error');
  expect(parsed.err.stack).toContain('something went wrong');
});

it('should log object with message', async () => {
  logger.info({ foo: 42 }, 'some info');

  await flushEventLoop();

  assert(typeof logs[0] !== 'undefined');
  const parsed = JSON.parse(logs[0]);

  expect(parsed.foo).toBe(42);
  expect(parsed.msg).toBe('some info');
});

it('creates child logger with bindings', async () => {
  const child = logger.child({ jobId: 'abc123' });
  child.info('starting job');

  await flushEventLoop();

  const last = logs.find((m) => m.includes('starting job'))!;
  expect(last).toMatch(/"jobId":"abc123"/);
});
