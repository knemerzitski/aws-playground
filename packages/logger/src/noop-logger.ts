import { Logger } from './types';

export class NoopLogger implements Logger {
  fatal() {}
  error() {}
  warn() {}
  info() {}
  debug() {}
  trace() {}
  child(): Logger {
    return this;
  }
  setLevel() {}
}
