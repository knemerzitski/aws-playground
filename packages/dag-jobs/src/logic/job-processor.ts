import { Logger, NoopLogger } from '@repo/logger';
import { JobHandler } from '../interfaces/job-handler';
import { JobRepository } from '../interfaces/job-repository';
import { JobResultResolver } from '../interfaces/job-result-resolver';
import { RepositoryJobResultResolver } from '../adapters/repository-job-result-resolver';

interface JobProcessorDependencies {
  readonly handlers: JobHandler[];
  readonly repository: JobRepository;
  readonly logger?: Logger;
  readonly resolver?: JobResultResolver;
}

export class JobProcessor {
  private readonly handlers;
  private readonly repository;
  private readonly logger;
  private readonly resolver;

  constructor({ handlers, repository, logger, resolver }: JobProcessorDependencies) {
    this.handlers = handlers;
    this.repository = repository;
    this.logger = logger ?? new NoopLogger();
    this.resolver = resolver ?? new RepositoryJobResultResolver(repository);
  }

  async process(jobId: string) {
    const log = this.logger.child({ jobId });

    const job = await this.repository.get(jobId);
    if (!job) {
      const err = new Error('Job not found');
      log.error(err, 'Failed to fetch job from repository');
      throw err;
    }

    if (job.status !== 'pending') {
      const err = new Error(
        `Cannot process job with status '${job.status}'. Expected status: 'pending'.`
      );
      log.error(
        { err, jobStatus: job.status },
        'Job is not in a pending state for processing'
      );
      throw err;
    }

    if (job.dependencies.length !== job.completedDependencies.length) {
      const incompleteDeps = job.dependencies.filter(
        (depId) => !job.completedDependencies.includes(depId)
      );

      const err = new Error(
        `Cannot process job: ${incompleteDeps.length} dependencies are incomplete.`
      );
      log.error(
        { err, incompleteDependencies: incompleteDeps },
        'Job cannot be processed until all dependencies are completed'
      );
      throw err;
    }

    const handler = this.handlers.find((h) => h.canHandle(job));
    if (!handler) {
      const err = new Error(`No handler found for job type: ${job.type}`);
      log.error({ err, jobType: job.type }, 'Failed to find suitable job handler');
      throw err;
    }

    try {
      log.debug('Starting job execution');
      const wasInProgressMarked = await this.repository.markInProgress(job.id);
      if (!wasInProgressMarked) {
        const err = new Error('Failed to mark job as in-progress');
        log.error(err, 'Failed to mark job as in-progress in repository');
        throw err;
      }

      const result = await handler.execute(job.payload, this.resolver);

      const wasSaved = await this.repository.saveResultAndMarkCompleted(job.id, result);
      if (!wasSaved) {
        const err = new Error('Failed to save job result');
        log.error(err, 'Failed to save job result and mark as completed in repository');
        throw err;
      }

      log.debug('Job execution completed');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      log.error(errorObj, 'Job execution failed');

      try {
        const wasFailMarked = await this.repository.markFailed(jobId, errorObj.message);
        if (!wasFailMarked) {
          log.fatal('Failed to persist job failure status in repository');
        }
      } catch (markErr) {
        log.fatal(
          {
            err: markErr instanceof Error ? markErr : new Error(String(markErr)),
            originalError: errorObj,
          },
          'CRITICAL: Error while marking job as failed'
        );
      }

      throw errorObj;
    }
  }
}
