import { Job } from '../../core/job';
import { JobRepository } from '../../interfaces/job-repository';

export class InMemoryJobRepository implements JobRepository {
  private jobById;

  constructor(jobs: readonly Job[]) {
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

  saveResult(jobId: string, result: Job['result']): Promise<boolean> {
    const job = this.jobById.get(jobId);
    if (job === undefined) {
      return Promise.resolve(false);
    }

    this.jobById.set(job.id, {
      ...job,
      status: 'completed',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      result: result as any,
    });

    return Promise.resolve(true);
  }

  markFailed(jobId: string, message: string): Promise<boolean> {
    const job = this.jobById.get(jobId);
    if (job === undefined) {
      return Promise.resolve(false);
    }

    this.jobById.set(job.id, {
      ...job,
      status: 'failed',
      result: null,
      failedAt: new Date().toISOString(),
      failureReason: message,
    });

    return Promise.resolve(true);
  }
}
