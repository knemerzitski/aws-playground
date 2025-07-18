import { parseMathExpression } from '@repo/math-expr';
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

  
  const expressionTree = parseMathExpression(expr);
  const result = expressionTree.evaluate();
  
  console.log(`Calculated expression: ${expr}=${result}`);

  return res.status(200).json({
    result,
  });
});

app.listen(PORT, () => {
  console.log(`Math service listening on port ${PORT}`);
});
