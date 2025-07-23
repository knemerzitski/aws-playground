import { assert, expect, it } from 'vitest';
import { Expression, parseExpression } from '@repo/math-expression';
import { expressionToJobs } from '../expression/expression-to-jobs';
import { Job } from '../job.types';
import {
  AdditionHandler,
  DivisionHandler,
  MultiplicationHandler,
  NumberLiteralHandler,
  SubtractionHandler,
} from '../expression/handlers';
import { JobHandler, JobRepository } from '../types';

it('should evaluate expression jobs for distributed compute', async () => {
  await evaluateExpect('1', 1);
  await evaluateExpect('1 + 5', 6);
  await evaluateExpect('1 + (2 + 10 + 3) * 5', 76);
});

async function evaluateExpect(expressionString: string, expected: number) {
  const expression = parseExpression(expressionString);

  expect(expression.evaluate()).toStrictEqual(expected);
  await expect(distributedEvaluate(expression)).resolves.toStrictEqual(expected);
}

async function distributedEvaluate(expression: Expression): Promise<number> {
  const jobs = expressionToJobs(expression);

  const struct = createJobsProcessor(jobs, null);
  await struct.processJobs();

  assert(jobs[0]?.result?.type === 'number-literal');

  return jobs[0]?.result.value;
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

  const repository: JobRepository<Job> = {
    get: (jobId: string) => Promise.resolve(jobs.find((job) => job.id === jobId)),
    saveResult: (jobId, result) => {
      const job = jobs.find((job) => job.id === jobId);
      if (job === undefined) {
        throw new Error(`Save failed, job doesn't exist: ${jobId}`);
      }

      job.status = 'completed';
      job.result = result;

      return Promise.resolve();
    },
  };

  const jobHandlers: JobHandler<Job>[] = [
    new AdditionHandler(),
    new SubtractionHandler(),
    new MultiplicationHandler(),
    new DivisionHandler(),
    new NumberLiteralHandler(),
  ];

  function isJobReady<T extends Job>(
    job: T
  ): job is T & { status: 'pending' | 'failed' } {
    return job.status === 'pending' || job.status === 'failed';
  }

  async function processJob(job: Job) {
    if (!isJobReady(job)) {
      throw new Error(`Cannot process unready job: ${job.id}`);
    }

    log?.(`Processing job: ${job.id}`);

    for (const handler of jobHandlers) {
      if (handler.canHandle(job)) {
        await handler.execute(job, repository);
        completedJob(job);
        updateJobDependants(job);

        return;
      }
    }

    throw new Error(`Unsupported job type: ${job.type}`);
  }

  const readyJobs = jobs.filter(
    (job) => job.status === 'pending' && job.incompleteDependenciesCount === 0
  );

  return {
    processJobs: async () => {
      let job: Job | undefined;
      while ((job = readyJobs.pop()) !== undefined) {
        await processJob(job);
      }
    },
  };
}
