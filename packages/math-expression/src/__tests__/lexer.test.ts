import { expect, it } from 'vitest';
import { UnknownCharLexerError, tokenizeString, Token } from '../lexer';

function collectTokenizeString(value: string): Token[] {
  return [...tokenizeString(value)];
}

it('should tokenize all known tokens', () => {
  expect(collectTokenizeString('5+-*/()')).toStrictEqual<Token[]>([
    {
      position: 0,
      type: 'number',
      value: 5,
    },
    {
      position: 1,
      type: 'operator',
      value: '+',
    },
    {
      position: 2,
      type: 'operator',
      value: '-',
    },
    {
      position: 3,
      type: 'operator',
      value: '*',
    },
    {
      position: 4,
      type: 'operator',
      value: '/',
    },
    {
      position: 5,
      type: 'left-paren',
      value: '(',
    },
    {
      position: 6,
      type: 'right-paren',
      value: ')',
    },
  ]);
});

it('should tokenize longer number', () => {
  expect(collectTokenizeString('123')).toStrictEqual<Token[]>([
    {
      position: 0,
      type: 'number',
      value: 123,
    },
  ]);
});

it('should tokenize longer number between other tokens', () => {
  expect(collectTokenizeString('/123)')).toStrictEqual<Token[]>([
    {
      position: 0,
      type: 'operator',
      value: '/',
    },
    {
      position: 1,
      type: 'number',
      value: 123,
    },
    {
      position: 4,
      type: 'right-paren',
      value: ')',
    },
  ]);
});

it('should ignore whitespaces', () => {
  expect(collectTokenizeString('  5 \r\n + \t2')).toStrictEqual<Token[]>([
    {
      position: 2,
      type: 'number',
      value: 5,
    },
    {
      position: 7,
      type: 'operator',
      value: '+',
    },
    {
      position: 10,
      type: 'number',
      value: 2,
    },
  ]);
});

it('should return empty array on empty string', () => {
  expect(collectTokenizeString('')).toStrictEqual<Token[]>([]);
});

it('should throw InvalidTokenLexerError on unknown token', () => {
  expect(() => collectTokenizeString('@')).toThrow(UnknownCharLexerError);
});

it('should throw InvalidTokenLexerError on unknown token with correct info', () => {
  expect(() => collectTokenizeString('45 + q-')).toThrowError(
    new UnknownCharLexerError({
      position: 5,
      value: 'q',
    })
  );
});
