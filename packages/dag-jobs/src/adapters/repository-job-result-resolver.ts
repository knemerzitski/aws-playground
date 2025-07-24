import { Job } from '../core/job';
import { JobRepository } from '../interfaces/job-repository';
import { JobResultResolver } from '../interfaces/job-result-resolver';

export class RepositoryJobResultResolver implements JobResultResolver {
  constructor(private readonly repository: Pick<JobRepository, 'get'>) {}

  async getResult(jobId: string): Promise<NonNullable<Job['result']>> {
    const job = await this.repository.get(jobId);
    if (!job) {
      throw new Error(`Referenced job ${jobId} not found`);
    }

    if (job.status !== 'completed') {
      throw new Error(
        `Referenced job ${jobId} is not completed yet (status: ${job.status})`
      );
    }

    return job.result;
  }
}
