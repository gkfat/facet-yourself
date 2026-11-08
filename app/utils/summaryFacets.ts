export type SummaryFacet = {
    /** The fact the trait follows from, as it was written: "「接收資訊：直覺（N）」" (one or several, in quotes) */
    from: string;
    name: string;
    description: string;
    overuse: string;
};

/** A trait is written as "從「接收資訊：直覺（N）」來看，你傾向「創新突破」：愛嘗試新做法。", then "用得太過時：點子多、完成少。" */
const FACET_PATTERN = /^(?:從(.+?)來看，)?你傾向「(.+?)」：(.*?)。?$/s;
const OVERUSE_PATTERN = /^用得太過時：(.*?)。?$/s;

/** The sentences of the summary told into the traits (each with what it looks like when overdone) and the sentences that are neither. */
export function parseSummary(texts: readonly string[]): { facets: SummaryFacet[]; others: string[] } {
    const facets: SummaryFacet[] = [];
    const others: string[] = [];

    for (const text of texts) {
        const facet = FACET_PATTERN.exec(text);
        const overuse = OVERUSE_PATTERN.exec(text);
        const last = facets.at(-1);

        if (facet) {
            facets.push({
                from: facet[1] ?? '', name: facet[2] ?? '', description: facet[3] ?? '', overuse: '',
            });
        } else if (overuse && last && last.overuse === '') {
            last.overuse = overuse[1] ?? '';
        } else {
            others.push(text);
        }
    }

    return {
        facets, others,
    };
}

/** The traits that follow from the same fact, together and in the order they first come: the fact is said once, ahead of them. */
export function groupByFact(facets: readonly SummaryFacet[]): Array<{ from: string; facets: SummaryFacet[] }> {
    const groups: Array<{ from: string; facets: SummaryFacet[] }> = [];

    for (const facet of facets) {
        const group = groups.find((item) => item.from === facet.from);

        if (group) {
            group.facets.push(facet);
        } else {
            groups.push({
                from: facet.from, facets: [facet],
            });
        }
    }

    return groups;
}
