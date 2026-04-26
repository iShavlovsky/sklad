export function getValueAtPath(
  value: Record<string, unknown>,
  path: string | undefined
): unknown {
  if (!path) {
    return undefined;
  }

  return path.split('.').reduce<unknown>((currentValue, part) => {
    if (
      currentValue === null ||
      currentValue === undefined ||
      typeof currentValue !== 'object'
    ) {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[part];
  }, value);
}
