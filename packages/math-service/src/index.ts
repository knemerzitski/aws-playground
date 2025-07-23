import 'source-map-support/register';

import { ExpressionError, parseExpression } from '@repo/math-expression';
import express from 'express';
import { loadEnv } from './load-env';

loadEnv();

const PORT = process.env.SERVICE_PORT ?? 3000;

const app = express();

app.get('/eval', (req, res) => {
  const { expr: exprString } = req.query;

  if (typeof exprString !== 'string') {
    return res.status(400).json({
      error: 'Missing required query parameter: expr',
    });
  }

  try {
    const expressionTree = parseExpression(exprString);
    const result = expressionTree.evaluate();

    console.debug(`Calculated expression: ${exprString} = ${result}`);

    return res.status(200).json({
      result,
    });
  } catch (err) {
    if (err instanceof ExpressionError) {
      return res.status(400).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Math service listening on port ${PORT}`);
});
