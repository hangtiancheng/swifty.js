/**
 * Maps items to results while running at most `limit` tasks concurrently.
 * Result order matches input order. The first task rejection propagates.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`Concurrency limit must be a positive integer, got ${limit}`);
  }

  const results = new Array<R>(items.length);
  // Workers pull from a shared iterator; next() is called synchronously
  // between awaits, so each index is claimed exactly once.
  const iterator = items.entries();
  const workerCount = Math.min(limit, items.length);

  async function worker(): Promise<void> {
    for (const [index, item] of iterator) {
      results[index] = await task(item, index);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}
