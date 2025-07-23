import { IncompleteJob, Job } from './job.types';
import { JobHandler, JobRepository } from './types';

export class JobProcessor {
  constructor(
    private readonly handlers: JobHandler<Job>[],
    private readonly repository: JobRepository<Job>
  ) {}

  async process(jobId: string) {
    const job = await this.repository.get(jobId);
    // console.debug(`Processing job: ${jobId}`);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (!this.isIncompleteJob(job)) {
      throw new Error(`Cannot process job with status: ${job.status}`);
    }

    if (job.incompleteDependenciesCount > 0) {
      throw new Error('Cannot process job with incomplete dependencies');
    }

    const handler = this.handlers.find((h) => h.canHandle(job));
    if (!handler) {
      throw new Error(`No handler for job type: ${job.type}`);
    }

    try {
      await handler.execute(job, this.repository);
    } catch (err) {
      await this.repository.markFailed(
        jobId,
        err instanceof Error ? err.message : 'unknown'
      );
    }
  }

  private isIncompleteJob<T extends Job>(job: T): job is IncompleteJob<T> {
    return job.status === 'pending' || job.status === 'failed';
  }
}
