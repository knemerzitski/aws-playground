import { expect, it } from 'vitest';

const PORT = process.env.API_PORT ?? '7000';
const ENDPOINT = `http://localhost:${PORT}/echo`;

it('echos back "Hello world!"', async () => {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: 'Hello world!',
  });

  const data = await res.text();

  expect(data).toStrictEqual('Hello world!');
});
