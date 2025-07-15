import { it } from 'vitest';

it('@typescript-eslint/no-unused-vars', () => {
  function ignoreRestSiblings(props: { id: string; name: string; value: number }) {
    const { id, ...rest } = props;
    console.log(rest.name, rest.value);
  }

  function argsIgnorePattern(data: object, _event: Event) {
    console.log('Data:', data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const badVarsIgnorePattern = true;
  const _goodVarsIgnorePattern = true;

  const destructuredArrayIgnorePattern: [string, number] = ['hello', 123];
  const [_ignoreMe, count] = destructuredArrayIgnorePattern;
  console.log(count);

  // Make function used
  console.log(ignoreRestSiblings, argsIgnorePattern);
});
