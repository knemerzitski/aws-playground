import { ExpressionError } from "./errors";

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

const OPERATORS = ['+', '-', '*', '/'] as const;
export type Operator = (typeof OPERATORS)[number];

export const LEFT_PAREN = '(';
export const RIGHT_PAREN = ')';

const WHITESPACE = [' ', '\t', '\r', '\n'] as const;

export type Token = NumberToken | OperatorToken | LeftParenToken | RightParenToken;

interface BaseToken {
  readonly position: number;
}

export interface NumberToken extends BaseToken {
  readonly type: 'number';
  readonly value: number;
}

export interface OperatorToken extends BaseToken {
  readonly type: 'operator';
  readonly value: Operator;
}

export interface LeftParenToken extends BaseToken {
  readonly type: 'left-paren';
  readonly value: typeof LEFT_PAREN;
}

export interface RightParenToken extends BaseToken {
  readonly type: 'right-paren';
  readonly value: typeof RIGHT_PAREN;
}

export class LexerError extends ExpressionError {}

export class UnknownCharLexerError extends LexerError {
  readonly position;
  readonly value;

  constructor({ position, value }: { position: number; value: string }) {
    super(`Unknown character "${value}" at position ${position}`);
    this.position = position;
    this.value = value;
  }
}

export function* tokenizeString(value: string): Generator<Token> {
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (!char) {
      continue;
    }

    if (isDigit(char)) {
      const { number, stringLength } = parseFirstNumberFromStart(value.substring(i));

      yield {
        position: i,
        type: 'number',
        value: number,
      };

      // Adjust by -1 due to for loop counter
      i += stringLength - 1;
    } else if (isOperator(char)) {
      yield {
        position: i,
        type: 'operator',
        value: char,
      };
    } else if (isLeftParen(char)) {
      yield {
        position: i,
        type: 'left-paren',
        value: LEFT_PAREN,
      };
    } else if (isRightParen(char)) {
      yield {
        position: i,
        type: 'right-paren',
        value: RIGHT_PAREN,
      };
    } else if (isWhitespace(char)) {
      // Ignore whitespace
    } else {
      throw new UnknownCharLexerError({
        position: i,
        value: char,
      });
    }
  }
}

function parseFirstNumberFromStart(value: string) {
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (!char) {
      continue;
    }

    if (!isDigit(char)) {
      return {
        number: Number.parseInt(value.substring(0, i)),
        stringLength: i,
      };
    }
  }

  return {
    number: Number.parseInt(value),
    stringLength: value.length,
  };
}

function isDigit(char: string): char is Digit {
  return '0' <= char && char <= '9';
}

function isOperator(char: string): char is Operator {
  return OPERATORS.includes(char as Operator);
}

function isLeftParen(char: string): boolean {
  return char === LEFT_PAREN;
}

function isRightParen(char: string): boolean {
  return char === RIGHT_PAREN;
}

function isWhitespace(char: string): boolean {
  return WHITESPACE.includes(char as (typeof WHITESPACE)[number]);
}
