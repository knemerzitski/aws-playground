import { Job } from '../core/job';
import { JobResultResolver } from './job-result-resolver';

export interface JobHandler<TJob extends Job = Job> {
  canHandle(job: Pick<Job, 'type'>): job is TJob;
  execute(
    payload: TJob['payload'],
    resolver: JobResultResolver
  ): Promise<NonNullable<TJob['result']>>;
}
