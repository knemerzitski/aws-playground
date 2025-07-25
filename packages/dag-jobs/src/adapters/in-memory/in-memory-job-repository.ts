import { EventBus } from '@repo/event-bus';
import { Job } from '../../core/job';
import { JobRepository } from '../../interfaces/job-repository';
import { JobEvents } from '../../core/events';

export class InMemoryJobRepository implements JobRepository {
  private jobById;

  constructor(
    jobs: readonly Job[],
    private readonly jobBus: Pick<EventBus<JobEvents>, 'publish'>
  ) {
    this.jobById = new Map<string, Job>(jobs.map((job) => [job.id, job]));
  }

  getAllJobs(): Job[] {
    return [...this.jobById.values()];
  }

  setJob(job: Job) {
    this.jobById.set(job.id, job);
  }

  get(jobId: string): Promise<Job | undefined> {
    return Promise.resolve(this.jobById.get(jobId));
  }

  markInProgress(jobId: string): Promise<boolean> {
    const job = this.jobById.get(jobId);
    if (job === undefined) {
      return Promise.resolve(false);
    }

    try {
      // Transaction start

      this.jobById.set(job.id, {
        ...job,
        status: 'in-progress',
        result: null,
      });

      void this.jobBus.publish('job:in-progress', {
        jobId: job.id,
      });

      // Commit transaction

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Rollback transaction
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  saveResultAndMarkCompleted(jobId: string, result: Job['result']): Promise<boolean> {
    const job = this.jobById.get(jobId);
    if (job === undefined) {
      return Promise.resolve(false);
    }

    try {
      // Transaction start

      this.jobById.set(job.id, {
        ...job,
        status: 'completed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        result: result as any,
      });

      void this.jobBus.publish('job:completed', {
        jobId: job.id,
      });

      // Commit transaction

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Rollback transaction
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  markFailed(jobId: string, message: string): Promise<boolean> {
    const job = this.jobById.get(jobId);
    if (job === undefined) {
      return Promise.resolve(false);
    }

    try {
      // Transaction start

      this.jobById.set(job.id, {
        ...job,
        status: 'failed',
        result: null,
        failedAt: new Date().toISOString(),
        failureReason: message,
      });

      void this.jobBus.publish('job:failed', {
        jobId: job.id,
        reason: message,
      });

      // Commit transaction

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Rollback transaction
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  getDependents(jobId: string): Promise<Job[]> {
    return Promise.resolve(
      [...this.jobById.values()].filter((job) => job.dependencies.includes(jobId))
    );
  }

  addCompletedDependency(
    targetJobId: string,
    completedDependencyId: string
  ): Promise<boolean> {
    const job = this.jobById.get(targetJobId);
    if (job === undefined) {
      return Promise.resolve(false);
    }

    // TODO what if completedDependencyId doesn't exist

    try {
      // Transaction start

      this.jobById.set(job.id, {
        ...job,
        completedDependencies: [...job.completedDependencies, completedDependencyId],
      });

      // Commit transaction

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Rollback transaction
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }
}
