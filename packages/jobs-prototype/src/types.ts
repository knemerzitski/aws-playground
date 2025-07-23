import { IncompleteJob, Job } from './job.types';

export interface JobRepository<TJob extends Job> {
  get(jobId: string): Promise<Job | undefined>;
  saveResult(jobId: string, result: TJob['result']): Promise<void>;
  markFailed(jobId: string, message: string): Promise<void>;
}

export interface JobHandler<TJob extends Job> {
  canHandle(job: Job): job is TJob;
  execute(job: IncompleteJob<TJob>, repository: JobRepository<TJob>): Promise<void>;
}
