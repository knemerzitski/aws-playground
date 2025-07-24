import { Job } from './job.types';

export interface JobRepository<TJob extends Job = Job> {
  get(jobId: string): Promise<Job | undefined>;
  saveResult(jobId: string, result: TJob['result']): Promise<boolean>;
  markFailed(jobId: string, message: string): Promise<boolean>;
}

export interface JobHandler<TJob extends Job = Job> {
  canHandle(job: Job): job is TJob;
  execute(job: TJob, repository: JobRepository<TJob>): Promise<void>;
}

export interface DependencyResolver {
  resolveDependencies(complatedJobId: string): Promise<boolean>;
}
