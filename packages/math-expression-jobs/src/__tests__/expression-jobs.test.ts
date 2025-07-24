import { assert, expect, it } from 'vitest';
import { Expression, parseExpression } from '@repo/math-expression';
import { expressionToJobs } from '../expression-to-jobs';
import {
  AdditionHandler,
  DivisionHandler,
  MultiplicationHandler,
  NumberLiteralHandler,
  SubtractionHandler,
} from '../handlers';
import { Logger, PinoLogger } from '@repo/logger';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { InMemoryJobRepository, Job, JobHandler, JobProcessor } from '@repo/dag-jobs';

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
  function completedJob(_job: Job) {
    log?.(`Job completed`);
  }

  function updateJobDependants(completedJob: Job) {
    const dependents = jobRepository
      .getAllJobs()
      .filter((job) => job.dependencies.includes(completedJob.id));
    log?.(`Updating dependants`);
    for (const dep of dependents) {
      const updatedJob: Job = {
        ...dep,
        unresolvedDependencies: dep.unresolvedDependencies - 1,
      };
      jobRepository.setJob(updatedJob);

      if (updatedJob.unresolvedDependencies === 0) {
        log?.(`Ready to process: ${updatedJob.id}`);
        readyJobs.push(updatedJob);
      }
    }
  }

  const logger: Logger = new PinoLogger(
    pino(
      pinoPretty({
        sync: true,
        colorize: true,
      })
    )
  );
  logger.setLevel('info');

  const jobRepository = new InMemoryJobRepository(jobs);

  const jobHandlers: JobHandler<Job>[] = [
    new AdditionHandler(),
    new SubtractionHandler(),
    new MultiplicationHandler(),
    new DivisionHandler(),
    new NumberLiteralHandler(),
  ];

  const jobProcessor = new JobProcessor({
    handlers: jobHandlers,
    repository: jobRepository,
    logger,
  });

  const readyJobs: Job[] = jobRepository
    .getAllJobs()
    .filter((job) => job.status === 'pending' && job.unresolvedDependencies === 0);

  return {
    processJobs: async () => {
      let job: Job | undefined;
      while ((job = readyJobs.pop()) !== undefined) {
        log?.(`Processing job: ${job.id}`);

        try {
          await jobProcessor.process(job.id);

          completedJob(job);
          updateJobDependants(job);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
          // keep processing other jobs
        }
      }

      return jobRepository.getAllJobs();
    },
  };
}
