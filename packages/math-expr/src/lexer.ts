type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

const OPERATORS = ['+', '-', '*', '/'] as const;
type Operator = (typeof OPERATORS)[number];

const LEFT_PAREN = '(';
const RIGHT_PAREN = ')';

const WHITESPACE = [' ', '\t', '\r', '\n'] as const;

export type Token = NumberToken | OperatorToken | LeftParenToken | RightParenToken;

interface NumberToken {
  type: 'number';
  value: number;
}

interface OperatorToken {
  type: 'operator';
  value: Operator;
}

interface LeftParenToken {
  type: 'left-paren';
}

interface RightParenToken {
  type: 'right-paren';
}

class LexerError extends Error {}

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
      // Adjust by -1 due to for loop counter
      i += stringLength - 1;

      yield {
        type: 'number',
        value: number,
      };
    } else if (isOperator(char)) {
      yield {
        type: 'operator',
        value: char,
      };
    } else if (isLeftParen(char)) {
      yield {
        type: 'left-paren',
      };
    } else if (isRightParen(char)) {
      yield {
        type: 'right-paren',
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
