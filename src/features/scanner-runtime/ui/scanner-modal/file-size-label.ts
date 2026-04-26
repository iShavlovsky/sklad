export function formatScannerFileSizeLabel(
  maxFileSizeBytes: number | null
): string {
  if (maxFileSizeBytes === null || maxFileSizeBytes <= 0) return 'не ограничен';
  const maxMegabytes = maxFileSizeBytes / (1024 * 1024);
  const roundedValue =
    Number.isInteger(maxMegabytes) || maxMegabytes >= 10
      ? String(Math.round(maxMegabytes))
      : maxMegabytes.toFixed(1);

  return `${roundedValue} МБ`;
}
