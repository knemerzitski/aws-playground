import { expect, it } from 'vitest';
import { Expression, parseExpression } from '@repo/math-expression';
import { expressionToJobs } from '../expression/expression-to-jobs';
import { Job, JobFromRegistry } from '../job.types';
import { ExpressionValue } from '../expression/types';

it('should evaluate expression jobs for distributed compute', () => {
  evaluateExpect('1', 1);
  evaluateExpect('1 + 5', 6);
  evaluateExpect('1 + (2 + 10 + 3) * 5', 76);
});

function evaluateExpect(expressionString: string, expected: number) {
  const expression = parseExpression(expressionString);

  expect(expression.evaluate()).toStrictEqual(expected);
  expect(distributedEvaluate(expression)).toStrictEqual(expected);
}

function distributedEvaluate(expression: Expression): number {
  const jobs = expressionToJobs(expression);

  const struct = createJobsProcessor(jobs, null);
  struct.processJobs();

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  return jobs[0]?.result!.value!;
}

function createJobsProcessor(jobs: Job[], log: typeof console.log | null = console.log) {
  function completedJob(_job: Job) {
    log?.(`Job completed`);
  }

  function updateJobDependants(completedJob: Job) {
    const dependents = jobs.filter((job) => job.dependencies.includes(completedJob.id));
    log?.(`Updating dependants`);
    for (const dep of dependents) {
      dep.incompleteDependenciesCount--;

      if (dep.incompleteDependenciesCount === 0) {
        log?.(`Ready to process: ${dep.id}`);
        readyJobs.push(dep);
      }
    }
  }

  function processJob(job: Job) {
    log?.(`Processing job: ${job.id}`);
    if (job.type === 'math:addition') {
      handleAddition(job);
    } else if (job.type === 'math:multiplication') {
      handleMultiplication(job);
    } else if (job.type === 'math:number-literal') {
      handleNumberLiteral(job);
    } else {
      throw new Error(`Unsupported job type: ${job.type}`);
    }
  }

  function handleAddition(job: JobFromRegistry<'math:addition'>) {
    const left = evalExprValue(job.payload.left);
    const right = evalExprValue(job.payload.right);

    const computationResult = left.value + right.value;

    job.status = 'completed';
    job.result = {
      type: 'number-literal',
      value: computationResult,
    };
    completedJob(job);
    updateJobDependants(job);
  }

  function handleMultiplication(job: JobFromRegistry<'math:multiplication'>) {
    const left = evalExprValue(job.payload.left);
    const right = evalExprValue(job.payload.right);

    const computationResult = left.value * right.value;

    job.status = 'completed';
    job.result = {
      type: 'number-literal',
      value: computationResult,
    };
    completedJob(job);
    updateJobDependants(job);
  }

  function handleNumberLiteral(job: JobFromRegistry<'math:number-literal'>) {
    job.status = 'completed';
    job.result = job.payload;
    completedJob(job);
    updateJobDependants(job);
  }

  function evalExprValue(expr: ExpressionValue) {
    if (expr.type === 'number-literal') {
      return expr;
    }

    const job = jobs.find((job) => job.id === expr.value);
    if (!job) {
      throw new Error(`Job not found: ${expr.value}`);
    }

    if (job.status !== 'completed') {
      throw new Error(`Attempted to access result of an incomplete job: ${job.id}`);
    }

    return job.result;
  }

  const readyJobs = jobs.filter(
    (job) => job.status === 'pending' && job.incompleteDependenciesCount === 0
  );

  return {
    processJobs: () => {
      let job: Job | undefined;
      while ((job = readyJobs.pop()) !== undefined) {
        processJob(job);
      }
    },
  };
}
