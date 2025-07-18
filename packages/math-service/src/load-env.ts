import { config } from 'dotenv';
import { join } from 'node:path';

export function loadEnv() {
  const environmentVariablesPaths = ['.env.local', '.env'];

  if (process.env.NODE_ENV) {
    environmentVariablesPaths.unshift(
      ...[`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`]
    );
  }

  const packageDirectory = join(import.meta.dirname, '../');

  environmentVariablesPaths.forEach((relPath) => {
    const envPath = join(packageDirectory, relPath);
    config({ path: envPath });
  });
}
