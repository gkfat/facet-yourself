import type { ReportFact } from './types';

/** Every mapping term a fact stands for, each with the words of the fact it is: one term, or one for each thing it lists. */
export function factTerms(fact: ReportFact): Array<{ term: string; value: string }> {
    return [
        ...(fact.term ? [
            {
                term: fact.term, value: fact.value,
            },
        ] : []), ...(fact.terms ?? []),
    ];
}
