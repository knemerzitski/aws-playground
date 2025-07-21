export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export type JobType =
  | 'math-expression:addition'
  | 'math-expression:subtraction'
  | 'math-expression:multiplication'
  | 'math-expression:division';

export type ExpressionValue = ExpressionResult | { type: 'job-id'; value: string };

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ExpressionResult = { type: 'literal'; value: number };

export type Operator = 'addition' | 'subtraction' | 'multiplication' | 'division';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Payload = {
  type: 'binary-expression';
  operator: Operator;
  left: ExpressionValue;
  right: ExpressionValue;
};

export type Result = ExpressionResult;

export interface Job {
  rootId: string;
  id: string;
  parentId?: string;
  status: JobStatus;
  dependencies: string[];
  incompleteDependenciesCount: number;
  type: JobType;
  version?: number;
  payload: Payload;
  result: Result | null;
  metrics: {
    computeTimeMs: number;
    retries: number;
  } | null;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  timeoutMs?: number;
  priority?: number;
  logs: string[];
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>;
  executionId?: string;
  createdAt: string;
  updatedAt: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
}
