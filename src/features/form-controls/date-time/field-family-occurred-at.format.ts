function padDateTimePart(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatIsoForDateTimePicker(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return (
    [
      parsed.getFullYear(),
      padDateTimePart(parsed.getMonth() + 1),
      padDateTimePart(parsed.getDate()),
    ].join('-') +
    ` ${padDateTimePart(parsed.getHours())}:${padDateTimePart(parsed.getMinutes())}:00`
  );
}
