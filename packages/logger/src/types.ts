export interface Logger {
  /**
   * App is crashing. Notify a human immediately!
   *
   * Used for crashes, corrupt state, failure to start, or any issue that demands urgent attention.
   *
   * Typical response:
   * SMS, Slack alerts, notifications, etc.
   *
   * Examples:
   * - Database connection failed at startup and the app cannot proceed.
   * - An uncaught exception causes the app to exit.
   */
  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(msg: string, ...args: any[]): void;

  /**
   * Operation failed due to a bug, exception, or service failure.
   *
   * Indicates errors that need fixing but do not halt the app.
   *
   * Examples:
   * - Failed to send email due to SMTP error.
   * - Payment gateway returned an error.
   * - Unexpected exception in business logic.
   */
  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;

  /**
   * Unexpected but non-critical issues (e.g., invalid input, soft failures).
   *
   * Used for rule violations, misconfigurations, or recoverable problems.
   *
   * Examples:
   * - User attempted access without proper role (not malicious).
   * - Rate limit exceeded.
   * - Fallback triggered (e.g., default locale loaded because preferred one was missing).
   */
  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;

  /**
   * Expected business events, such as user actions or app state changes.
   *
   * Examples:
   * - App started.
   * - User signed up.
   * - Payment successful.
   */
  info(obj: unknown, msg?: string, ...args: any[]): void;

  info(msg: string, ...args: any[]): void;

  /**
   * Internal logic useful for debugging; typically less frequent in production.
   *
   * Examples:
   * - API response time.
   * - Calculated values or DB query results.
   */
  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(msg: string, ...args: any[]): void;

  /**
   * Detailed debug logs for deep-dive troubleshooting; very verbose.
   *
   * Use sparingly when tracking very low-level operations.
   *
   * Examples:
   * - Entering/exiting functions.
   * - Loop iterations or recursive steps.
   */
  trace(obj: unknown, msg?: string, ...args: any[]): void;
  trace(msg: string, ...args: any[]): void;

  child(bindings: Bindings): Logger;

  setLevel(level: LevelWithSilent): void;
}

export type Bindings = Record<string, any>;

export type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LevelWithSilent = Level | 'silent';
