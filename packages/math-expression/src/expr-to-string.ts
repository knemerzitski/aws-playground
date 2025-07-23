import { LEFT_PAREN, RIGHT_PAREN } from './lexer';
import {
  BinaryExpression,
  getBinaryExpressionOperator,
} from './parser/binary-expression';
import { Expression } from './parser/expression';
import { Literal } from './parser/literal';

export function stringifyExpression(expression: Expression): string {
  if (expression instanceof BinaryExpression) {
    return `${LEFT_PAREN}${stringifyExpression(expression.left)} ${getBinaryExpressionOperator(expression)} ${stringifyExpression(expression.right)}${RIGHT_PAREN}`;
  } else if (expression instanceof Literal) {
    return String(expression.evaluate());
  } else {
    throw new Error(`Unsupported expression "${expression.constructor.name}"`);
  }
}
