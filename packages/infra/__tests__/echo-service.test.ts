import { expect, it } from 'vitest';

it('echos back "Hello world!"', async () => {
  const res = await fetch('http://localhost:3000/echo', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: 'Hello world!',
  });

  const data = await res.text();

  expect(data).toStrictEqual('Hello world!');
});
