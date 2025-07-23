export interface NumberLiteralValue {
  type: 'number-literal';
  value: number;
}

interface JobReferenceValue {
  type: 'job-id';
  value: string;
}

export type ExpressionValue = JobReferenceValue | NumberLiteralValue;

export interface BinaryExpressionBasePayload<TOperator> {
  type: 'binary-expression';
  operator: TOperator;
  left: ExpressionValue;
  right: ExpressionValue;
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
