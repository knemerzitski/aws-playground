import { Logger, NoopLogger } from '@repo/logger';
import { Job } from '../core/job';
import { JobHandler } from '../interfaces/job-handler';
import { JobRepository } from '../interfaces/job-repository';

export class JobProcessor {
  constructor(
    private readonly handlers: JobHandler<Job>[],
    private readonly repository: JobRepository<Job>,
    private readonly logger: Logger = new NoopLogger()
  ) {}

  async process(jobId: string) {
    const log = this.logger.child({ jobId });

    const job = await this.repository.get(jobId);
    if (!job) {
      const err = new Error('Job not found');
      log.error(err, 'Failed to fetch job from repository');
      throw err;
    }

    if (!this.hasProcessableStatus(job)) {
      const err = new Error(`Job status invalid for processing: ${job.status}`);
      log.error(
        { err, jobStatus: job.status },
        'Cannot process job due to invalid status'
      );
      throw err;
    }

    if (job.unresolvedDependencies > 0) {
      const err = new Error('Job has incomplete dependencies');
      log.error(
        {
          err,
          jobDependencies: job.dependencies,
          unresolvedDependenciesCount: job.unresolvedDependencies,
        },
        'Cannot process job until dependencies are completed'
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
      await handler.execute(job, this.repository);
      log.debug('Job execution completed');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      log.error(errorObj, 'Job execution failed');

      try {
        const wasFailMarked = await this.repository.markFailed(jobId, errorObj.message);
        if (!wasFailMarked) {
          log.error('Failed to persist job failure status in repository');
        }
      } catch (markErr) {
        log.error(
          markErr instanceof Error ? markErr : new Error(String(markErr)),
          'Error while marking job as failed'
        );
      }

      throw errorObj;
    }
  }

  private hasProcessableStatus<T extends Job>(job: T) {
    return job.status === 'pending' || job.status === 'failed';
  }
}
