import { CONTEXT_VALUES } from '../../shared/ontology/context';

type ImpactBlock = {
    key: string;
    segments: ReadonlyArray<{
        text: string;
        sources: ReadonlyArray<{ fragment?: string | undefined }>;
    }>;
};

const GROUP_LABELS = {
    object: '對象', domain: '領域',
} as const;

/**
 * The map of effects by who or what it is about, not by trait: one card for each context ("自己", "伴侶", "工作夥伴"…),
 * with what every trait of the report says there put together in the order of the traits. The time values are left out.
 */
export function impactCards(blocks: readonly ImpactBlock[]) {
    const impacts = blocks.filter((block) => block.key.startsWith('impact:'));

    return (['object', 'domain'] as const).map((kind) => ({
        kind,
        label: GROUP_LABELS[kind],
        cards: CONTEXT_VALUES.filter((context) => context.kind === kind).flatMap((context) => {
            const texts = impacts.flatMap((block) => block.segments.filter((segment) => segment.sources.some((source) => source.fragment?.split('|')[1] === context.id)).map((segment) => segment.text));

            return texts.length > 0
                ? [
                    {
                        context: context.id, name: context.name, text: texts.join(''),
                    },
                ]
                : [];
        }),
    })).filter((group) => group.cards.length > 0);
}
