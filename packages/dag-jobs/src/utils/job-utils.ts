import { Job } from '../core/job';

export function isJobReady<T extends Job>(
  job: T
): job is T & { status: 'pending'; unresolvedDependencies: 0 } {
  return job.status === 'pending' && job.unresolvedDependencies === 0;
}
