import { Job } from '../core/job';

export interface JobResultResolver {
  getResult(jobId: string): Promise<NonNullable<Job['result']>>;
}
