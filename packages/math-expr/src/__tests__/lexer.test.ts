import { expect, it } from 'vitest';
import { UnknownCharLexerError, tokenizeString, Token } from '../lexer';

function collectTokenizeString(value: string): Token[] {
  return [...tokenizeString(value)];
}

it('should tokenize all known tokens', () => {
  expect(collectTokenizeString('5+-*/()')).toStrictEqual<Token[]>([
    {
      type: 'number',
      value: 5,
    },
    {
      type: 'operator',
      value: '+',
    },
    {
      type: 'operator',
      value: '-',
    },
    {
      type: 'operator',
      value: '*',
    },
    {
      type: 'operator',
      value: '/',
    },
    {
      type: 'left-paren',
    },
    {
      type: 'right-paren',
    },
  ]);
});

it('should tokenize longer number', () => {
  expect(collectTokenizeString('123')).toStrictEqual<Token[]>([
    {
      type: 'number',
      value: 123,
    },
  ]);
});

it('should tokenize longer number between other tokens', () => {
  expect(collectTokenizeString('/123)')).toStrictEqual<Token[]>([
    {
      type: 'operator',
      value: '/',
    },
    {
      type: 'number',
      value: 123,
    },
    {
      type: 'right-paren',
    },
  ]);
});

it('should ignore whitespaces', () => {
  expect(collectTokenizeString('  5 \r\n + \t2')).toStrictEqual<Token[]>([
    {
      type: 'number',
      value: 5,
    },
    {
      type: 'operator',
      value: '+',
    },
    {
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
