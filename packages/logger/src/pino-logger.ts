/* eslint-disable @typescript-eslint/no-explicit-any */
import pino from 'pino';

import { Bindings, LevelWithSilent, Logger } from './types';

export class PinoLogger implements Logger {
  constructor(private readonly logger: ReturnType<typeof pino>) {}

  getRawLogger(): ReturnType<typeof pino> {
    return this.logger;
  }

  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(msg: string, ...args: any[]): void;
  fatal(...args: Parameters<pino.Logger['fatal']>): void {
    this.logger.fatal(...args);
  }

  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
  error(...args: Parameters<pino.Logger['error']>): void {
    this.logger.error(...args);
  }

  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  warn(...args: Parameters<pino.Logger['warn']>): void {
    this.logger.warn(...args);
  }

  info(obj: unknown, msg?: string, ...args: any[]): void;
  info(msg: string, ...args: any[]): void;
  info(...args: Parameters<pino.Logger['info']>): void {
    this.logger.info(...args);
  }

  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(msg: string, ...args: any[]): void;
  debug(...args: Parameters<pino.Logger['debug']>): void {
    this.logger.debug(...args);
  }

  trace(obj: unknown, msg?: string, ...args: any[]): void;
  trace(msg: string, ...args: any[]): void;
  trace(...args: Parameters<pino.Logger['trace']>): void {
    this.logger.trace(...args);
  }

  child(bindings: Bindings): Logger {
    return new PinoLogger(this.logger.child(bindings));
  }

  setLevel(level: LevelWithSilent): void {
    this.logger.level = level;
  }
}
