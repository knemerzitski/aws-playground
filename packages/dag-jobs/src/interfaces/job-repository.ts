import { Job } from '../core/job';

export interface JobRepository<TJob extends Job = Job> {
  get(jobId: string): Promise<Job | undefined>;
  markInProgress(jobId: string): Promise<boolean>;
  saveResultAndMarkCompleted(jobId: string, result: TJob['result']): Promise<boolean>;
  markFailed(jobId: string, message: string): Promise<boolean>;
  getDependents(jobId: string): Promise<Job[]>;
  addCompletedDependency(targetJobId: string, completedDependencyId: string): Promise<boolean>;
}
