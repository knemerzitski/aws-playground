import { JobRegistry } from './job-registry';
import { JobFromRegistry } from './job-from-registry';
import { JobStatus } from './job-status';

interface JobBase {
  readonly rootId: string;
  readonly id: string;
  readonly parentId?: string;
  readonly dependencies: string[];
  readonly unresolvedDependencies: number;
  readonly status: JobStatus;
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

export type PendingJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status:  JobStatus & 'pending';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: null;
};

export type InProgressJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status: JobStatus & 'in-progress';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: null;
};

export type CompletedJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status: JobStatus & 'completed';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: JobRegistry[K]['result'];
};

export type FailedJob<K extends keyof JobRegistry> = JobBase & {
  readonly type: K;
  readonly status: JobStatus & 'failed';
  readonly payload: JobRegistry[K]['payload'];
  readonly result: null;
  readonly failedAt: string;
  readonly failureReason: string;
};

export type Job = {
  [K in keyof JobRegistry]: JobFromRegistry<K>;
}[keyof JobRegistry];
