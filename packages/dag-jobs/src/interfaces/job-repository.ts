import { Job } from '../core/job';


export interface JobRepository<TJob extends Job = Job> {
  get(jobId: string): Promise<Job | undefined>;
  saveResult(jobId: string, result: TJob['result']): Promise<boolean>;
  markFailed(jobId: string, message: string): Promise<boolean>;
}
