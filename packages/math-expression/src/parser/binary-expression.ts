import { Operator } from '../lexer';
import { Expression } from './expression';

export abstract class BinaryExpression extends Expression {
  constructor(
    readonly left: Expression,
    readonly right: Expression
  ) {
    super();
  }
}

export class AddBinaryExpression extends BinaryExpression {
  override evaluate(): number {
    return this.left.evaluate() + this.right.evaluate();
  }
}
export class SubtractBinaryExpression extends BinaryExpression {
  override evaluate(): number {
    return this.left.evaluate() - this.right.evaluate();
  }
}

export class MultiplyBinaryExpression extends BinaryExpression {
  override evaluate(): number {
    return this.left.evaluate() * this.right.evaluate();
  }
}

export class DivideBinaryExpression extends BinaryExpression {
  override evaluate(): number {
    return this.left.evaluate() / this.right.evaluate();
  }
}

class BinaryExpressionRegistry {
  private readonly operatorToDef = new Map<Operator, BinaryExpressionDefinition>();
  private readonly factoryToDef = new Map<
    typeof BinaryExpression,
    BinaryExpressionDefinition
  >();

  register(definition: BinaryExpressionDefinition) {
    this.operatorToDef.set(definition.operator, definition);
    this.factoryToDef.set(definition.BinaryExpressionClass, definition);
  }

  getOperatorClass(operator: Operator): BinaryExpressionConstructor {
    return this.getDefFromOperator(operator).BinaryExpressionClass;
  }

  getOperator(binaryExpressionClass: typeof BinaryExpression): Operator {
    return this.getDefFromClass(binaryExpressionClass).operator;
  }

  isAssociative(binaryExpressionClass: typeof BinaryExpression) {
    return this.getDefFromClass(binaryExpressionClass).associative;
  }

  private getDefFromOperator(operator: Operator): BinaryExpressionDefinition {
    const def = this.operatorToDef.get(operator);
    if (def === undefined) {
      throw new Error(`Operator "${operator}" is not registered`);
    }

    return def;
  }

  private getDefFromClass(
    binaryExpressionClass: typeof BinaryExpression
  ): BinaryExpressionDefinition {
    const def = this.factoryToDef.get(binaryExpressionClass);
    if (def === undefined) {
      throw new Error(`Class "${binaryExpressionClass.name}" is not registered`);
    }

    return def;
  }
}

interface TemplateBinaryExpressionDefinition {
  operator: Operator;
  associative: boolean;
  BinaryExpressionClass: typeof BinaryExpression;
}

const binaryExpressionDefinitions = [
  {
    operator: '+',
    associative: true,
    BinaryExpressionClass: AddBinaryExpression,
  } satisfies TemplateBinaryExpressionDefinition,
  {
    operator: '-',
    associative: false,
    BinaryExpressionClass: SubtractBinaryExpression,
  } satisfies TemplateBinaryExpressionDefinition,
  {
    operator: '*',
    associative: true,
    BinaryExpressionClass: MultiplyBinaryExpression,
  } satisfies TemplateBinaryExpressionDefinition,
  {
    operator: '/',
    associative: false,
    BinaryExpressionClass: DivideBinaryExpression,
  } satisfies TemplateBinaryExpressionDefinition,
] as const;

type BinaryExpressionDefinition = (typeof binaryExpressionDefinitions)[number];
type BinaryExpressionConstructor = BinaryExpressionDefinition['BinaryExpressionClass'];

const binaryExpressionRegistry = new BinaryExpressionRegistry();
for (const def of binaryExpressionDefinitions) {
  binaryExpressionRegistry.register(def);
}

export function getOperatorBinaryExpressionConstructor(
  operator: Operator
): BinaryExpressionConstructor {
  return binaryExpressionRegistry.getOperatorClass(operator);
}

export function getBinaryExpressionOperator(
  binaryExpression: BinaryExpression
): Operator {
  return binaryExpressionRegistry.getOperator(
    binaryExpression.constructor as typeof BinaryExpression
  );
}

export function getBinaryExpressionConstructor(
  expression: BinaryExpression
): BinaryExpressionConstructor {
  const operator = getBinaryExpressionOperator(expression);
  return getOperatorBinaryExpressionConstructor(operator);
}

export function isBinaryExpressionAssociative(
  binaryExpression: BinaryExpression
): boolean {
  return binaryExpressionRegistry.isAssociative(
    binaryExpression.constructor as typeof BinaryExpression
  );
}
