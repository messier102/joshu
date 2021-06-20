import { weighted_distance, Weights } from "./distance";

function find_similar_string(
    dictionary: string[],
    weights: Weights,
    max_distance: number,
    query: string
): string[] {
    const dictionary_with_distances = dictionary.map((dict_entry) => ({
        word: dict_entry,
        distance: weighted_distance(query, dict_entry, weights),
    }));

    const similar_words = dictionary_with_distances
        .filter(({ distance }) => distance <= max_distance)
        .sort((a, b) => a.distance - b.distance)
        .map(({ word }) => word);

    return similar_words;
}

export { find_similar_string, Weights };
