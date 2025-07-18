import 'source-map-support/register';

import { MathExpressionError, parseMathExpression } from '@repo/math-expr';
import express from 'express';

const PORT = 3000;

const app = express();

app.get('/eval', (req, res) => {
  const { expr } = req.query;

  if (typeof expr !== 'string') {
    return res.status(400).json({
      error: 'Missing required query parameter: expr',
    });
  }

  try {
  const expressionTree = parseMathExpression(expr);
  const result = expressionTree.evaluate();
  
    console.debug(`Calculated expression: ${expr} = ${result}`);

  return res.status(200).json({
    result,
  });
  } catch (err) {
    if (err instanceof MathExpressionError) {
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
