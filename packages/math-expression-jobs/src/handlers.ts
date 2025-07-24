import {
  Job,
  JobFromRegistry,
  JobHandler,
  JobRegistry,
  JobResultResolver,
} from '@repo/dag-jobs';
import { ExpressionValue, NumberLiteralValue } from './types';

type BinaryOperationJobTypes =
  | 'math:addition'
  | 'math:subtraction'
  | 'math:multiplication'
  | 'math:division';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributiveJobFromRegistry<T extends keyof JobRegistry> = T extends any
  ? JobFromRegistry<T>
  : never;

type BinaryOperationJobs = DistributiveJobFromRegistry<BinaryOperationJobTypes>;

abstract class BinaryOperationHandler<TJob extends BinaryOperationJobs>
  implements JobHandler<TJob>
{
  constructor(private readonly type: TJob['type']) {}

  abstract evaluate(left: number, right: number): number;

  canHandle(job: Pick<Job, 'type'>): job is TJob {
    return this.type === job.type;
  }

  async execute(
    payload: TJob['payload'],
    resolver: JobResultResolver
  ): Promise<NonNullable<TJob['result']>> {
    const [left, right] = await Promise.all([
      this.evalValue(payload.left, resolver),
      this.evalValue(payload.right, resolver),
    ]);

    return {
      type: 'number-literal',
      value: this.evaluate(left.value, right.value),
    };
  }

  private async evalValue(
    expr: ExpressionValue,
    resolver: JobResultResolver
  ): Promise<NumberLiteralValue> {
    if (expr.type === 'number-literal') {
      return expr;
    }

    const jobResult = await resolver.getResult(expr.value);

    if (jobResult.type !== 'number-literal') {
      throw new Error(
        `Invalid job result type for ${expr.value}: expected "number-literal", got "${jobResult.type}"`
      );
    }

    return jobResult;
  }
}

export class AdditionHandler extends BinaryOperationHandler<
  JobFromRegistry<'math:addition'>
> {
  constructor() {
    super('math:addition');
  }

  override evaluate(left: number, right: number): number {
    return left + right;
  }
}

export class SubtractionHandler extends BinaryOperationHandler<
  JobFromRegistry<'math:subtraction'>
> {
  constructor() {
    super('math:subtraction');
  }

  override evaluate(left: number, right: number): number {
    return left - right;
  }
}

export class MultiplicationHandler extends BinaryOperationHandler<
  JobFromRegistry<'math:multiplication'>
> {
  constructor() {
    super('math:multiplication');
  }

  override evaluate(left: number, right: number): number {
    return left * right;
  }
}

export class DivisionHandler extends BinaryOperationHandler<
  JobFromRegistry<'math:division'>
> {
  constructor() {
    super('math:division');
  }

  override evaluate(left: number, right: number): number {
    return left / right;
  }
}

export class NumberLiteralHandler<
  TJob extends
    JobFromRegistry<'math:number-literal'> = JobFromRegistry<'math:number-literal'>,
> implements JobHandler<TJob>
{
  canHandle(job: Pick<Job, 'type'>): job is TJob {
    return job.type === 'math:number-literal';
  }

  execute(payload: TJob['payload']): Promise<NonNullable<TJob['result']>> {
    return Promise.resolve(payload);
  }
}
