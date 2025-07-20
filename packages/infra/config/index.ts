export interface AppConfig {
  /**
   * Function code changes are immediately updated and reflected in runtime
   *
   *
   */
  watch?: boolean;
}

// watch only when developing in watch mode?

export function createConfigFromEnv(): AppConfig {
  return {
    watch: watch(),
  };
}

function watch(): AppConfig['watch'] {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return process.env.WATCH === 'true' || process.env.WATCH === '1';
}
