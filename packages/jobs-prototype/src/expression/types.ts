export interface NumberLiteralValue {
  readonly type: 'number-literal';
  readonly value: number;
}

interface JobReferenceValue {
  readonly type: 'job-id';
  readonly value: string;
}

export type ExpressionValue = JobReferenceValue | NumberLiteralValue;

export interface BinaryExpressionBasePayload<TOperator> {
  readonly type: 'binary-expression';
  readonly operator: TOperator;
  readonly left: ExpressionValue;
  readonly right: ExpressionValue;
}

export type AdditionBinaryExpressionPayload = BinaryExpressionBasePayload<'addition'>;
export type SubtractionBinaryExpressionPayload =
  BinaryExpressionBasePayload<'subtraction'>;
export type MultiplicationBinaryExpressionPayload =
  BinaryExpressionBasePayload<'multiplication'>;
export type DivisionBinaryExpressionPayload = BinaryExpressionBasePayload<'division'>;

export type BinaryExpressionPayload =
  | AdditionBinaryExpressionPayload
  | SubtractionBinaryExpressionPayload
  | MultiplicationBinaryExpressionPayload
  | DivisionBinaryExpressionPayload;

export type ExpressionResult = NumberLiteralValue;

export type Operator = BinaryExpressionPayload['operator'];
