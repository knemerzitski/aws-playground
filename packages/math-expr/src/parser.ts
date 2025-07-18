import { MathExpressionError } from './errors';
import { LeftParenToken, RIGHT_PAREN, Token, tokenizeString } from './lexer';

abstract class Statement {}

abstract class Expression extends Statement {
  abstract evaluate(): number;
}

abstract class Literal extends Expression {}

class NumberLiteral extends Literal {
  constructor(readonly value: number) {
    super();
  }

  override evaluate(): number {
    return this.value;
  }
}

abstract class BinaryExpression extends Expression {
  constructor(
    readonly left: Expression,
    readonly right: Expression
  ) {
    super();
  }
}

const BINARY_EXPRESSION_MAP = {
  '+': class AddBinaryExpression extends BinaryExpression {
    override evaluate(): number {
      return this.left.evaluate() + this.right.evaluate();
    }
  },
  '-': class SubtractBinaryExpression extends BinaryExpression {
    override evaluate(): number {
      return this.left.evaluate() - this.right.evaluate();
    }
  },
  '*': class MultiplyBinaryExpression extends BinaryExpression {
    override evaluate(): number {
      return this.left.evaluate() * this.right.evaluate();
    }
  },
  '/': class DivideBinaryExpression extends BinaryExpression {
    override evaluate(): number {
      return this.left.evaluate() / this.right.evaluate();
    }
  },
} as const;

export class ParserError extends MathExpressionError {}

export class EndOfTokensParserError extends ParserError {
  constructor() {
    super('Unexpected end of tokens');
  }
}

class TokenParserError extends ParserError {
  constructor(
    readonly token: Token,
    message: string
  ) {
    super(message);
  }
}

export class UnclosedParenthesisParserError extends TokenParserError {
  constructor({ token }: { token: LeftParenToken }) {
    super(
      token,
      `Unexpected open parenthesis "${token.value}" at position ${token.position}. Did you forget a closing parenthesis "${RIGHT_PAREN}"?`
    );
  }
}

export class UnexpectedTokenParserError extends TokenParserError {
  readonly expectedTokens;

  constructor({
    token,
    expectedTokens,
  }: {
    token: Token;
    expectedTokens: readonly (Token['type'] | 'eof')[];
  }) {
    super(
      token,
      `Unexpected character "${token.value}" at position ${token.position}. Expected token: ${expectedTokens.map((v) => `"${v}"`).join(', ')}`
    );
    this.expectedTokens = expectedTokens;
  }
}

class Parser {
  private readonly tokenGenerator;

  private currentToken: Token | null;
  private peekToken: Token | null;

  constructor(value: string) {
    this.tokenGenerator = tokenizeString(value);

    this.currentToken = null;
    this.peekToken = null;

    this.next();
  }

  parse(): Expression {
    const result = this.parseExpr();

    if (this.peekToken !== null) {
      throw new UnexpectedTokenParserError({
        token: this.peekToken,
        expectedTokens: ['eof'],
      });
    }

    return result;
  }

  private next() {
    this.currentToken = this.peekToken;

    const nextResult = this.tokenGenerator.next();
    this.peekToken = !nextResult.done ? nextResult.value : null;

    return this.currentToken;
  }

  /**
   * Grammar:
   * ```
   * expr   : term (('+' | '-') term)* ;
   * term   : factor (('*' | '/') factor)* ;
   * factor : NUMBER |  '(' expr ')' ;
   * ```
   */
  private parseExpr(): Expression {
    let expression = this.parseTerm();

    while (this.peekToken !== null) {
      if (this.peekToken.type !== 'operator') {
        break;
      }

      if (!['+', '-'].includes(this.peekToken.value)) {
        break;
      }

      const BinaryExpressionClass = BINARY_EXPRESSION_MAP[this.peekToken.value];

      this.next(); // Skip operator since already peeked
      const rightExpression = this.parseTerm();

      expression = new BinaryExpressionClass(expression, rightExpression);
    }

    return expression;
  }

  private parseTerm(): Expression {
    let expression = this.parseFactor();

    while (this.peekToken !== null) {
      if (this.peekToken.type !== 'operator') {
        break;
      }

      if (!['*', '/'].includes(this.peekToken.value)) {
        break;
      }

      const BinaryExpressionClass = BINARY_EXPRESSION_MAP[this.peekToken.value];

      this.next(); // Skip operator since already peeked
      const rightExpression = this.parseFactor();

      expression = new BinaryExpressionClass(expression, rightExpression);
    }

    return expression;
  }

  private parseFactor(): Expression {
    const token = this.next();
    if (!token) {
      throw new EndOfTokensParserError();
    }

    if (token.type === 'number') {
      return new NumberLiteral(token.value);
    }

    if (token.type === 'left-paren') {
      const expr = this.parseExpr();

      const rightParenToken = this.next();
      if (!rightParenToken) {
        throw new UnclosedParenthesisParserError({
          token: token,
        });
      }

      if (rightParenToken.type !== 'right-paren') {
        throw new UnexpectedTokenParserError({
          token: rightParenToken,
          expectedTokens: ['right-paren'],
        });
      }

      return expr;
    }

    throw new UnexpectedTokenParserError({
      token,
      expectedTokens: ['number', 'left-paren'],
    });
  }
}

export function parseString(value: string): Expression {
  return new Parser(value).parse();
}
