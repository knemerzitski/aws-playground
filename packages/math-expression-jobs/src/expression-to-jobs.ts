import {
  BinaryExpression,
  Expression,
  getBinaryExpressionOperator,
  NumberLiteral,
  Operator,
} from '@repo/math-expression';
import { randomUUID } from 'crypto';
import { BinaryExpressionBasePayload, Operator as NamedOperator } from './types';
import { Job } from '@repo/dag-jobs';

const TO_NAMED_OPERATOR: Record<Operator, NamedOperator> = {
  '+': 'addition',
  '-': 'subtraction',
  '*': 'multiplication',
  '/': 'division',
};

export function expressionToJobs(
  expression: Expression,
  options?: {
    rootId: string;
  }
): Job[] {
  return recursiveGetJobs(expression, {
    rootId: options?.rootId ?? randomUUID(),
    id: 0,
  });
}

function recursiveGetJobs(
  expression: Expression,
  context: {
    rootId: string;
    id: number;
  }
): [Job, ...Job[]] {
  const id = `${context.rootId}:${context.id}`;
  // Binary tree parent: (i - 1) / 2
  const parentId =
    context.id > 0 ? `${context.rootId}:${Math.floor((context.id - 1) / 2)}` : null;

  if (expression instanceof NumberLiteral) {
    return [
      {
        id,
        rootId: context.rootId,
        ...(parentId !== null && {
          parentId,
        }),
        status: 'pending',
        type: 'math:number-literal',
        payload: {
          type: 'number-literal',
          value: expression.evaluate(),
        },
        result: null,
        // createdAt: new Date().toISOString(),
        // attempts: 0,
        // logs: [],
        // updatedAt: null,
        // metrics: null,
        dependencies: [],
        completedDependencies: [],
      },
    ];
  }

  if (expression instanceof BinaryExpression) {
    const leftJobs = recursiveGetJobs(expression.left, {
      rootId: context.rootId,
      // Binary tree child left: 2 * i + 1
      id: 2 * context.id + 1,
    });

    const rightJobs = recursiveGetJobs(expression.right, {
      rootId: context.rootId,
      // Binary tree child left: 2 * i + 2
      id: 2 * context.id + 2,
    });

    const operator = getNamedOperator(expression);

    return [
      {
        id,
        rootId: context.rootId,
        ...(parentId !== null && {
          parentId,
        }),
        status: 'pending',
        type: `math:${operator}`,
        payload: {
          type: 'binary-expression',
          operator: operator,
          left: {
            type: 'job-id',
            value: leftJobs[0].id,
          },
          right: {
            type: 'job-id',
            value: rightJobs[0].id,
          },
        } satisfies BinaryExpressionBasePayload<typeof operator>,
        result: null,
        // createdAt: new Date().toISOString(),
        // attempts: 0,
        // logs: [],
        // updatedAt: null,
        // metrics: null,
        dependencies: [leftJobs[0].id, rightJobs[0].id],
        completedDependencies: [],
      } as Job,
      ...leftJobs,
      ...rightJobs,
    ];
  }

  throw new Error(`Unsupported expression ${expression.constructor.name}`);
}

function getNamedOperator(expression: BinaryExpression): NamedOperator {
  const operator = getBinaryExpressionOperator(expression);

  return TO_NAMED_OPERATOR[operator];
}
