import { JobRegistry } from './job.registry';

interface JobBase {
  rootId: string;
  id: string;
  parentId?: string;
  dependencies: string[];
  incompleteDependenciesCount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  // version?: number;
  // metrics: {
  //   computeTimeMs: number;
  //   retries: number;
  // } | null;
  // retryPolicy?: {
  //   maxAttempts: number;
  //   backoffMs: number;
  // };
  // attempts: number;
  // timeoutMs?: number;
  // priority?: number;
  // logs: string[];
  // tags?: string[];
  // context?: Record<string, unknown>;
  // executionId?: string;
  // createdAt: string;
  // updatedAt: string | null;
  // scheduledAt?: string;
}

type PendingJob<K extends keyof JobRegistry> = JobBase & {
  type: K;
  status: 'pending';
  payload: JobRegistry[K]['payload'];
  result: null;
};

type InProgressJob<K extends keyof JobRegistry> = JobBase & {
  type: K;
  status: 'in-progress';
  payload: JobRegistry[K]['payload'];
  result: null;
};

type CompletedJob<K extends keyof JobRegistry> = JobBase & {
  type: K;
  status: 'completed';
  payload: JobRegistry[K]['payload'];
  result: JobRegistry[K]['result'];
};

type FailedJob<K extends keyof JobRegistry> = JobBase & {
  type: K;
  status: 'failed';
  payload: JobRegistry[K]['payload'];
  result: null;
  failedAt: string;
  failureReason: string;
};

export type JobFromRegistry<K extends keyof JobRegistry> =
  | PendingJob<K>
  | InProgressJob<K>
  | CompletedJob<K>
  | FailedJob<K>;

export type Job = {
  [K in keyof JobRegistry]: JobFromRegistry<K>;
}[keyof JobRegistry];

