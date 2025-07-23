import { assert, expect, it } from 'vitest';
import { Expression, parseExpression } from '@repo/math-expression';
import { expressionToJobs } from '../expression/expression-to-jobs';
import { Job, ReadyJob } from '../job.types';
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
  await evaluateExpect('4 + (20 / 5 - 3) * 5', 9);
});

async function evaluateExpect(expressionString: string, expected: number) {
  const expression = parseExpression(expressionString);

  expect(expression.evaluate()).toStrictEqual(expected);
  await expect(distributedEvaluate(expression)).resolves.toStrictEqual(expected);
}

async function distributedEvaluate(expression: Expression): Promise<number> {
  const jobs = expressionToJobs(expression);

  const struct = createJobsProcessor(jobs, null);
  const processedJobs = await struct.processJobs();

  assert(processedJobs[0]?.result?.type === 'number-literal');

  return processedJobs[0]?.result.value;
}

function createJobsProcessor(jobs: Job[], log: typeof console.log | null = console.log) {
  const jobsMap = new Map<string, Job>(jobs.map((job) => [job.id, job]));

  function completedJob(_job: Job) {
    log?.(`Job completed`);
  }

  function updateJobDependants(completedJob: Job) {
    const dependents = [...jobsMap.values()].filter((job) =>
      job.dependencies.includes(completedJob.id)
    );
    log?.(`Updating dependants`);
    for (const dep of dependents) {
      const updatedJob: Job = {
        ...dep,
        incompleteDependenciesCount: dep.incompleteDependenciesCount - 1,
      };
      jobsMap.set(dep.id, updatedJob);

      if (updatedJob.incompleteDependenciesCount === 0) {
        log?.(`Ready to process: ${updatedJob.id}`);
        readyJobs.push(updatedJob);
      }
    }
  }

  const repository: JobRepository<Job> = {
    get: (jobId: string) => Promise.resolve(jobsMap.get(jobId)),
    saveResult: (jobId, result) => {
      const job = jobsMap.get(jobId);
      if (job === undefined) {
        throw new Error(`Save failed, job doesn't exist: ${jobId}`);
      }

      jobsMap.set(job.id, {
        ...job,
        status: 'completed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        result: result as any,
      });

      return Promise.resolve();
    },
    markFailed: (jobId, message) => {
      const job = jobsMap.get(jobId);
      if (job === undefined) {
        throw new Error(`Mark job failed, job doesn't exist: ${jobId}`);
      }

      jobsMap.set(job.id, {
        ...job,
        status: 'failed',
        result: null,
        failedAt: new Date().toISOString(),
        failureReason: message,
      });

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

  function isJobReady<T extends Job>(job: T): job is ReadyJob<T> {
    return job.status === 'pending' && job.incompleteDependenciesCount === 0;
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

  const readyJobs: Job[] = [...jobsMap.values()].filter(isJobReady);

  return {
    processJobs: async () => {
      let job: Job | undefined;
      while ((job = readyJobs.pop()) !== undefined) {
        await processJob(job);
      }

      return [...jobsMap.values()];
    },
  };
}
