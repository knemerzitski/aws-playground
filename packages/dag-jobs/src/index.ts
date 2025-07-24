import { InMemoryJobRepository } from './adapters/in-memory/in-memory-job-repository';
import { JobProcessor } from './logic/job-processor';
import { JobRegistry } from './core/job-registry';
import { Job } from './core/job';
import { JobFromRegistry } from './core/job-from-registry';
import { JobHandler } from './interfaces/job-handler';
import { JobRepository } from './interfaces/job-repository';
import { JobResultResolver } from './interfaces/job-result-resolver';

export { JobProcessor, InMemoryJobRepository };

export type {
  Job,
  JobFromRegistry,
  JobRegistry,
  JobRepository,
  JobHandler,
  JobResultResolver,
};
