import {
  AdditionBinaryExpressionPayload,
  DivisionBinaryExpressionPayload,
  ExpressionResult,
  MultiplicationBinaryExpressionPayload,
  NumberLiteralValue,
  SubtractionBinaryExpressionPayload,
} from './types';

declare module '../job.registry' {
  interface JobRegistry {
    'math:number-literal': {
      payload: NumberLiteralValue;
      result: ExpressionResult;
    };
    'math:addition': {
      payload: AdditionBinaryExpressionPayload;
      result: ExpressionResult;
    };
    'math:subtraction': {
      payload: SubtractionBinaryExpressionPayload;
      result: ExpressionResult;
    };
    'math:multiplication': {
      payload: MultiplicationBinaryExpressionPayload;
      result: ExpressionResult;
    };
    'math:division': {
      payload: DivisionBinaryExpressionPayload;
      result: ExpressionResult;
    };
  }
}
