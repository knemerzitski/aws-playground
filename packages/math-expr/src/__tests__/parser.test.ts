import { describe, expect, it } from 'vitest';
import {
  EndOfTokensParserError,
  parseExpression,
  UnclosedParenthesisParserError,
  UnexpectedTokenParserError,
} from '../parser';

function expr(value: string): number {
  return parseExpression(value).evaluate();
}

it('should parse number', () => {
  expect(expr('2')).toStrictEqual(2);
  expect(expr('663')).toStrictEqual(663);
});

it('should parse add', () => {
  expect(expr('5 + 3')).toStrictEqual(8);
  expect(expr('4 +0')).toStrictEqual(4);
  expect(expr('1 + 2 + 3 + 4')).toStrictEqual(10);
});

it('should parse subtract', () => {
  expect(expr('5 - 3')).toStrictEqual(2);
  expect(expr('4 - 5')).toStrictEqual(-1);
});

it('should parse multiply', () => {
  expect(expr('3*4')).toStrictEqual(12);
  expect(expr('9*2')).toStrictEqual(18);
});

it('should parse divide', () => {
  expect(expr('8/2')).toStrictEqual(4);
  expect(expr('21/3')).toStrictEqual(7);
  expect(expr('100/0')).toStrictEqual(Number.POSITIVE_INFINITY);
});

it('should precedence *,/ over +,-', () => {
  expect(expr('2 + 3 * 8')).toStrictEqual(26);
  expect(expr('3 * 8 + 2')).toStrictEqual(26);
  expect(expr('2 + 16 / 4')).toStrictEqual(6);
  expect(expr('16 / 4 + 2')).toStrictEqual(6);
});

it('should parse all operations', () => {
  expect(expr('5 + 4 - 2 * (9 / 3)')).toStrictEqual(3);
});

it('should parse nested precendence with parenthesis', () => {
  expect(expr('((2 + 3) * 4)')).toStrictEqual(20);
  expect(expr('2 *(5 + 3)')).toStrictEqual(16);
  expect(expr('2 *(5 + 3 + 2)')).toStrictEqual(20);
  expect(expr('2 * ((5 - 2) * (3 + 2))')).toStrictEqual(30);
});

describe('errors', () => {
  it('should throw error on unmached opening parenthesis', () => {
    expect(() => expr('(3 + 2 - 1')).toThrowError(UnclosedParenthesisParserError);
  });

  it('should throw error on missing number between operators', () => {
    expect(() => expr('(3 + * 1')).toThrowError(UnexpectedTokenParserError);
  });

  it('should throw error on empty expression', () => {
    expect(() => expr('')).toThrowError(EndOfTokensParserError);
  });

  it('should throw error on numbers without operations', () => {
    expect(() => expr('2 2')).toThrowError(UnexpectedTokenParserError);
  });
});
