import { EventBus } from '@repo/event-bus';
import { JobEvents } from '../../core/events';
import { JobProcessor } from '../../logic/job-processor';

export class JobProcessorEventBridge {
  private readonly jobReadyUnsubscribe;

  constructor(
    private readonly processor: JobProcessor,
    private readonly eventBus: EventBus<JobEvents>
  ) {
    this.jobReadyUnsubscribe = this.eventBus.subscribe(
      'job:ready',
      this.onJobReady.bind(this)
    );
  }

  dispose() {
    this.jobReadyUnsubscribe();
  }

  private onJobReady({ payload: { jobId } }: { payload: JobEvents['job:ready'] }) {
    return this.processor.process(jobId);
  }
}
