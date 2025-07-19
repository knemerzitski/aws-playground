import { expect, it } from 'vitest';

const PORT = process.env.SERVICE_PORT ?? '3200';
const ENDPOINT = `http://localhost:${PORT}/eval`;

function fetchEvalExpr(expr: string) {
  return fetch(`${ENDPOINT}?expr=${encodeURIComponent(expr)}`);
}

it('should evaluate expressions', async () => {
  expect(await (await fetchEvalExpr('2+2')).json()).toStrictEqual({
    result: 4,
  });

  expect(await (await fetchEvalExpr('5 * (3 + 2)')).json()).toStrictEqual({
    result: 25,
  });
});

it('should respond with "Bad Request" on missing query "eval"', async () => {
  const res = await fetch(ENDPOINT);
  expect(res.status).toStrictEqual(400);

  const json = await res.json();
  expect(json).toMatchInlineSnapshot(`
    {
      "error": "Missing required query parameter: expr",
    }
  `);
});

it('should gracefully handle exception from invalid math expressions', async () => {
  expect(await (await fetchEvalExpr('just some text')).json()).toMatchInlineSnapshot(`
    {
      "error": "Unknown character "j" at position 0",
    }
  `);
});
