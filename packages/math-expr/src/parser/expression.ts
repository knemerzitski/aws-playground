import { Statement } from './statement';

export abstract class Expression extends Statement {
  abstract evaluate(): number;
}
