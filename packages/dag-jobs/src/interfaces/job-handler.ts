import { Job } from '../core/job';
import { JobRepository } from './job-repository';


export interface JobHandler<TJob extends Job = Job> {
  canHandle(job: Job): job is TJob;
  execute(job: TJob, repository: JobRepository<TJob>): Promise<void>;
}
