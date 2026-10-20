export function fieldStyles(hasError: boolean) {
  return `w-full rounded-lg border bg-surface px-3 py-2.5 text-ink transition outline-none placeholder:text-ink-muted/70 focus:ring-1 ${
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger'
      : 'border-line focus:border-accent focus:ring-accent'
  }`
}
