import { PendingJob, InProgressJob, CompletedJob, FailedJob } from './job';
import { JobRegistry } from './job-registry';

export type JobFromRegistry<K extends keyof JobRegistry> =
  | PendingJob<K>
  | InProgressJob<K>
  | CompletedJob<K>
  | FailedJob<K>;
