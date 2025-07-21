import {
  BinaryExpression,
  getBinaryExpressionConstructor,
  getOperatorBinaryExpressionConstructor,
  isBinaryExpressionAssociative,
} from './binary-expression';
import { MathExpressionError } from '../errors';
import { LeftParenToken, RIGHT_PAREN, Token, tokenizeString } from '../lexer';
import { Expression } from './expression';
import { Literal, NumberLiteral } from './literal';

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

      const BinaryExpressionConstructor = getOperatorBinaryExpressionConstructor(
        this.peekToken.value
      );

      this.next(); // Skip operator since already peeked
      const rightExpression = this.parseTerm();

      expression = new BinaryExpressionConstructor(expression, rightExpression);
      expression = this.flattenAssociativeChain(expression);
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

      const BinaryExpressionClass = getOperatorBinaryExpressionConstructor(
        this.peekToken.value
      );

      this.next(); // Skip operator since already peeked
      const rightExpression = this.parseFactor();

      expression = new BinaryExpressionClass(expression, rightExpression);
      expression = this.flattenAssociativeChain(expression);
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

  /**
   * Reduce depth of expressions consisting of consecutive associative chain.
   *
   * Example: `((1 + 2) + 3) + 4` => `(1 + 2) + (3 + 4)`
   */
  private flattenAssociativeChain(rootExpression: Expression): Expression {
    if (!(rootExpression instanceof BinaryExpression)) {
      return rootExpression;
    }

    if (!isBinaryExpressionAssociative(rootExpression)) {
      return rootExpression;
    }

    const rootLeft = rootExpression.left;
    if (!(rootLeft instanceof BinaryExpression)) {
      return rootExpression;
    }

    const rootRight = rootExpression.right;

    function isEqualToRootPrototype(node: Expression) {
      return Object.getPrototypeOf(rootExpression) === Object.getPrototypeOf(node);
    }

    const hasNestedAssociativeExpressions =
      isEqualToRootPrototype(rootLeft) &&
      isEqualToRootPrototype(rootLeft.left) &&
      rootLeft.right instanceof Literal;

    if (!hasNestedAssociativeExpressions) {
      return rootExpression;
    }

    const BinaryExpressionConstructor = getBinaryExpressionConstructor(rootExpression);

    return new BinaryExpressionConstructor(
      rootLeft.left,
      new BinaryExpressionConstructor(rootLeft.right, rootRight)
    );
  }
}

export function parseString(value: string): Expression {
  return new Parser(value).parse();
}
