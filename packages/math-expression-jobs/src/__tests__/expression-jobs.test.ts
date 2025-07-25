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
import {
  DependencyResolver,
  InMemoryJobRepository,
  Job,
  JobHandler,
  JobProcessor,
  JobProcessorEventBridge,
} from '@repo/dag-jobs';
import { EventBus } from '@repo/event-bus';
import { JobEvents } from '../../../dag-jobs/src/core/events';

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

  const processedJobs = await processJobs(jobs);

  assert(processedJobs[0]?.result?.type === 'number-literal');

  return processedJobs[0]?.result.value;
}

async function processJobs(jobs: Job[]): Promise<Job[]> {
  const logger: Logger = new PinoLogger(
    pino(
      pinoPretty({
        sync: true,
        colorize: true,
      })
    )
  );
  logger.setLevel('info');

  const eventBus = new EventBus<JobEvents>();

  const jobRepository = new InMemoryJobRepository(jobs, eventBus);

  new DependencyResolver(eventBus, jobRepository);

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

  new JobProcessorEventBridge(jobProcessor, eventBus);

  for (const job of jobRepository.getAllJobs()) {
    if (
      job.status === 'pending' &&
      job.dependencies.length === job.completedDependencies.length
    ) {
      void eventBus.publish('job:ready', {
        jobId: job.id,
      });
    }
  }

  // Wait for jobs to be resolved
  await new Promise((res) => {
    setTimeout(res, 10);
  });

  return jobRepository.getAllJobs();
}
