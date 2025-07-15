import { it, expectTypeOf } from 'vitest';

it('lib = ESNext', () => {
  const setA = new Set([1, 2, 3]);
  const setB = new Set([3, 4, 5]);

  // union and intersection is not available in ES2024 (according to tsconfig)
  setA.union(setB);
  setA.intersection(setB);
});

it('strict = true', () => {
  function noImplicitThis() {
    // @ts-expect-error noImplicitThis
    return this.width * this.height;
  }

  // @ts-expect-error noImplicitReturns
  function noImplicitReturns(color: 'blue' | 'black'): string {
    if (color === 'blue') {
      return 'beats';
    } else {
      ('bose');
    }
  }
});

it('noUnusedLocals = false', () => {
  const noUnusedLocals = false;
  {
    // Expect no warn
    const blockNoUnusedLocals = false;
  }
});

it('noUncheckedIndexedAccess = true', () => {
  interface StringRecord {
    // Unknown properties are covered by this index signature.
    [name: string]: string;
  }

  const strRecord: StringRecord = {};

  expectTypeOf(strRecord.unknownName).toEqualTypeOf<string | undefined>();
});

it('noUnusedParameters = true', () => {
  // @ts-expect-error noUnusedParameters
  function createDefaultKeyboard(unusedParameter: boolean) {}
});

it('noImplicitOverride = true', () => {
  class Base {
    foo() {
      // Default behavior
    }
  }

  class Child extends Base {
    // @ts-expect-error noImplicitOverride
    foo() {}
  }
});
