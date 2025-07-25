import { EventBus } from '@repo/event-bus';
import { JobEvents } from '../core/events';
import { JobRepository } from '../interfaces/job-repository';

export class DependencyResolver {
  private readonly jobCompletedUnsubscribe;

  constructor(
    private readonly jobBus: EventBus<Pick<JobEvents, 'job:completed' | 'job:ready'>>,
    private readonly repository: Pick<
      JobRepository,
      'getDependents' | 'addCompletedDependency'
    >
  ) {
    this.jobCompletedUnsubscribe = jobBus.subscribe(
      'job:completed',
      ({ payload: { jobId } }) => this.resolveDependencies(jobId)
    );
  }

  dispose() {
    this.jobCompletedUnsubscribe();
  }

  async resolveDependencies(completedJobId: string): Promise<void> {
    const dependents = await this.repository.getDependents(completedJobId);

    for (const dep of dependents) {
      void this.repository.addCompletedDependency(dep.id, completedJobId).then(() => {
        if (dep.dependencies.length === dep.completedDependencies.length + 1) {
          void this.jobBus.publish('job:ready', {
            jobId: dep.id,
          });
        }
      });
    }
  }
}
