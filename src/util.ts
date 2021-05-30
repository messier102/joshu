/**
 * Creates an iterable range of numeric values from `start` (inclusive) to `end`
 * (exclusive). Useful for defining for-loops.
 *
 * @param start - Starting value of the range (inclusive).
 * @param end - Ending value of the range (exclusive).
 * @param step - Distance between two consequtive values (default 1).
 *
 * @example
 * ```ts
 * for (const i of range(0, 5)) { ... }
 * ```
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

/**
 * Creates a pairwise iterator over the elements of two arrays.
 *
 * Unlike the lodash `zip` which pads the shorter array of the two with
 * `undefined`, causing the element type to become nullable, this version is
 * modeled after Rust's `zip` and produces `min(left.length, right.length)`
 * pairs, guaranteeing non-nullable types.
 *
 * @param left - First array to iterate over.
 * @param right - Second array to iterate over.
 *
 * @example
 * ```ts
 * const left = [1, 2, 3]
 * const right = ["a", "b", "c"]
 *
 * for (const [digit, char] of zip(left, right)) { ... }
 * ```
 */
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

/**
 * Creates a string describing a quantity of some value, using plural form of
 * the unit where appropriate.
 *
 * By default simply adds an "s" to `unit` to create its plural form. If the
 * unit has an irregular plural form ("woman" - "women") or is a complex
 * term ("degree Celsius" - "degrees Celsius"), you can provide a custom
 * plural form via `plural_form`.
 *
 * @param amount - Amount of some value.
 * @param unit - Unit of some value in singular form.
 * @param plural_form - (optional) Custom plural form of the unit.
 *
 * @example
 * ```ts
 * pluralize(1, "ball") === "1 ball";
 * pluralize(2, "ball") === "2 balls";
 * pluralize(0, "ball") === "0 balls";
 * pluralize(-20, "degree") === "-20 degrees"
 * pluralize(2, "woman", "women") === "2 women";
 * ```
 */
export function pluralize(
    amount: number,
    unit: string,
    plural_form?: string
): string {
    return amount === 1
        ? `${amount} ${unit}`
        : `${amount} ${plural_form ?? unit + "s"}`;
}
