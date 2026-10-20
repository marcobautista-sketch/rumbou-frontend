export function fieldStyles(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-3 py-2 transition outline-none focus:ring-2 dark:bg-slate-900 ${
    hasError
      ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-slate-700 dark:focus:ring-indigo-900'
  }`
}
