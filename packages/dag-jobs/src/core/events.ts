export interface JobEvents {
  'job:ready': {
    jobId: string;
  };
  'job:in-progress': {
    jobId: string;
  };
  'job:completed': {
    jobId: string;
  };
  'job:failed': {
    jobId: string;
    reason: string;
  };
}

export type OutboxEvent = {
  [K in keyof JobEvents]: {
    id: string;
    timestamp: string;
    type: K;
    payload: JobEvents[K];
  };
}[keyof JobEvents];
