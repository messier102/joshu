export type Weights = {
    insertion: number;
    deletion: number;
    substitution: number;
};

/**
 * Calculates the Levenshtein distance between two strings.
 *
 * Uses a two-row iterative algorithm, slightly modified to allow weighting the string transformations.
 *
 * Adapted from https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
 *
 * @param string1 first string to compare
 * @param string2 second string to compare
 * @param weights costs of the string transformations (deletion, insertion, substitution)
 * @returns weighted Levenshtein distance between string1 and string2
 */
export function weighted_distance(
    string1: string,
    string2: string,
    weights: Weights
): number {
    if (string1 === string2) return 0;
    if (!string1) return string2.length;
    if (!string2) return string1.length;

    let previous_row = new Array<number>(string2.length + 1).fill(0);
    let current_row = new Array<number>(string2.length + 1).fill(0);

    for (let i = 0; i < string2.length; i++) {
        previous_row[i] = i * weights.insertion;
    }

    for (let i = 0; i < string1.length; i++) {
        current_row[0] = (i + 1) * weights.deletion;

        for (let j = 0; j < string2.length; j++) {
            const deletion_cost = previous_row[j + 1] + weights.deletion;
            const insertion_cost = current_row[j] + weights.insertion;
            const substitution_cost =
                string1[i] === string2[j]
                    ? previous_row[j]
                    : previous_row[j] + weights.substitution;

            current_row[j + 1] = Math.min(
                deletion_cost,
                insertion_cost,
                substitution_cost
            );
        }

        [previous_row, current_row] = [current_row, previous_row];
    }

    return previous_row[string2.length];
}
