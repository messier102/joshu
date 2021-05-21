/**
 * Creates an iterable range of numeric values from `start` (inclusive)
 * to `end` (exclusive). Useful for defining for-loops.
 *
 * @param start The starting value of the range (inclusive)
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

export function* zip<T, U>(
    left: readonly T[],
    right: readonly U[]
): Generator<[T, U]> {
    const left_iter = left[Symbol.iterator]();
    const right_iter = right[Symbol.iterator]();

    while (true) {
        const left_next = left_iter.next();
        if (left_next.done) {
            break;
        }

        const right_next = right_iter.next();
        if (right_next.done) {
            break;
        }

        yield [left_next.value, right_next.value];
    }
}
