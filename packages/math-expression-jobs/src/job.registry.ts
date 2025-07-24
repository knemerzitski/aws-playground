import {
  AdditionBinaryExpressionPayload,
  DivisionBinaryExpressionPayload,
  ExpressionResult,
  MultiplicationBinaryExpressionPayload,
  NumberLiteralValue,
  SubtractionBinaryExpressionPayload,
} from './types';

declare module '@repo/dag-jobs' {
  interface JobRegistry {
    'math:number-literal': {
      readonly payload: NumberLiteralValue;
      readonly result: ExpressionResult;
    };
    'math:addition': {
      readonly payload: AdditionBinaryExpressionPayload;
      readonly result: ExpressionResult;
    };
    'math:subtraction': {
      readonly payload: SubtractionBinaryExpressionPayload;
      readonly result: ExpressionResult;
    };
    'math:multiplication': {
      readonly payload: MultiplicationBinaryExpressionPayload;
      readonly result: ExpressionResult;
    };
    'math:division': {
      readonly payload: DivisionBinaryExpressionPayload;
      readonly result: ExpressionResult;
    };
  }
}
