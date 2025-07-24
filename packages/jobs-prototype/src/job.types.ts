import { JobRegistry } from './job.registry';

interface JobBase {
  readonly rootId: string;
  readonly id: string;
  readonly parentId?: string;
  readonly dependencies: string[];
  readonly incompleteDependenciesCount: number;
  readonly status: 'pending' | 'in-progress' | 'completed' | 'failed';
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
  readonly type: K;
  readonly status: 'pending';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: null;
};

type InProgressJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status: 'in-progress';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: null;
};

type CompletedJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status: 'completed';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: JobRegistry[K]['result'];
};

type FailedJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status: 'failed';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: null;
  readonly failedAt: string;
  readonly failureReason: string;
};

export type JobFromRegistry<K extends keyof JobRegistry> =
  | PendingJob<K>
  | InProgressJob<K>
  | CompletedJob<K>
  | FailedJob<K>;

export type Job = {
  [K in keyof JobRegistry]: JobFromRegistry<K>;
}[keyof JobRegistry];
