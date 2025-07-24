import { JobRegistry } from '../job.registry';
import { Job, JobFromRegistry } from '../job.types';
import { JobHandler, JobRepository } from '../types';
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

  canHandle(job: Job): job is TJob {
    return this.type === job.type;
  }

  async execute(job: TJob, repo: JobRepository<TJob>): Promise<void> {
    const payload = job.payload;

    const [left, right] = await Promise.all([
      this.evalValue(payload.left, repo),
      this.evalValue(payload.right, repo),
    ]);

    const computationResult = this.evaluate(left.value, right.value);

    await repo.saveResult(job.id, {
      type: 'number-literal',
      value: computationResult,
    });
  }

  private async evalValue(
    expr: ExpressionValue,
    repo: JobRepository<TJob>
  ): Promise<NumberLiteralValue> {
    if (expr.type === 'number-literal') {
      return expr;
    }

    const job = await repo.get(expr.value);
    if (!job) {
      throw new Error(
        `Failed to evaluate expression: referenced job not found (${expr.value})`
      );
    }
    if (job.status !== 'completed') {
      throw new Error(
        `Cannot evaluate expression: job ${expr.value} is not completed (status: ${job.status})`
      );
    }

    if (job.result.type !== 'number-literal') {
      throw new Error(
        `Invalid job result type for ${expr.value}: expected "number-literal", got "${job.result.type}"`
      );
    }

    return job.result;
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
  canHandle(job: Job): job is TJob {
    return job.type === 'math:number-literal';
  }

  async execute(job: TJob, repo: JobRepository<TJob>): Promise<void> {
    const computationResult = job.payload;

    await repo.saveResult(job.id, computationResult);
  }
}
