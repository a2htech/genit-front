export interface LaravelPage<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

/** Laravel resource collections paginate server-side; the front wants the full list per (level, ...). */
export async function fetchAllPages<T>(fetchPage: (page: number) => Promise<LaravelPage<T>>): Promise<T[]> {
  const first = await fetchPage(1)
  if (first.meta.last_page <= 1) return first.data
  const rest = await Promise.all(
    Array.from({ length: first.meta.last_page - 1 }, (_, i) => fetchPage(i + 2)),
  )
  return [first.data, ...rest.map((page) => page.data)].flat()
}
