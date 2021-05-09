/**
 * Creates an iterable range of numeric values from `start` (inclusive)
 * to `end` (exclusive). Useful for defining for-loops.
 *
 * @param start The starting of the range (inclusive)
 * @param end The ending value of the range (exclusive)
 * @param step The distance between two consequtive values (default 1).
 *
 * @example
 * for (const i of range(0, 5)) { ... }
 */
export function* range(
    start: number,
    end: number,
    step = 1
): Generator<number> {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}
