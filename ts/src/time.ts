export function isPast(time: number) {
  return new Date().getTime() > time;
}

export function isFuture(time: number) {
  return new Date().getTime() < time;
}

// deno-lint-ignore require-await
export async function sleep(microseconds: number) {
  return new Promise((r) => setTimeout(r, microseconds));
}
