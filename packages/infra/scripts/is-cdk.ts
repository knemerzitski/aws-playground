/**
 * Simple script to check if environment variable 'AWS' is set in project root .env files
 */

import { loadEnv } from './utils/load-env';

// TODO ask for commands directly and run or the other instead of using bash pipes

loadEnv();

function isTruthy(value: string | undefined) {
  return value === 'true' || value === '1';
}

if (isTruthy(process.env.AWS_CDK)) {
  process.exit(0);
} else {
  console.error(`Expected environment variable "AWS_CDK" to be defined`);
  process.exit(1);
}
