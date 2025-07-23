import { Expression } from './expression';

export abstract class Literal extends Expression {}

export class NumberLiteral extends Literal {
  constructor(readonly value: number) {
    super();
  }

  override evaluate(): number {
    return this.value;
  }
}
