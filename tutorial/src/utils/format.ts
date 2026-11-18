export function formatFileSize(bytes: number): string {
  const megabytes = bytes / 1024 / 1024;

  return megabytes >= 1 ? `${Math.round(megabytes)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

export function formatList(items: string[]): string {
  if (items.length <= 1) {
    return items.join('');
  }

  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}
