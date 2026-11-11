import type { FixedContentBody } from '../../schemas/firestore/fixedContent.schema';
import type {
    Palace, ZiweiStar,
} from '../../constants/ziwei';
import { borrowedStarsOf } from './borrowed';
import type {
    BorrowedStars, PalaceChart, StarPlacement, ZiweiChart,
} from './types';

/** The parts of a fixed content body the readings are put together from. */
export type ZiweiReadingContent = Pick<FixedContentBody, 'title' | 'summary' | 'strengths' | 'blindSpots' | 'growthAdvice'>;

/** The fixed content of a Zi Wei key (`star_紫微`, `palace_命宮`, `transformation_忌` …), or undefined when it is not published. */
export type ZiweiContentLookup = (key: string) => ZiweiReadingContent | undefined;

export type ReadingSentence = {
    text: string;
    /** The fixed content keys this sentence is made of, so every sentence can be traced to its source. */
    contentKeys: string[];
    /**
     * What the sentence is, so a page can lay the reading out in cards instead of one block: the meaning of the palace,
     * a star of it, the strengths and the things to watch of its stars, an auxiliary star, a 四化, the note that a palace
     * is empty, what is borrowed for it, and the advice.
     */
    kind: 'context' | 'star' | 'strengths' | 'watch' | 'aux' | 'transformation' | 'empty' | 'borrowed' | 'advice';
};

export type PalaceReading = {
    kind: 'LIFE' | 'BODY';
    palace: Palace;
    sentences: ReadingSentence[];
    /** Set when the palace has no main star of its own and its reading leans on the opposite palace; the borrowed stars are a reading, never a fact of the chart. */
    borrowed: BorrowedStars | null;
};

export class ZiweiContentMissingError extends Error {
    readonly key: string;

    constructor(key: string) {
        super(`Zi Wei content is not available: ${key}`);
        this.name = 'ZiweiContentMissingError';
        this.key = key;
    }
}

/**
 * The few connecting words the rules add around the fixed readings. They are tentative like the readings themselves and are
 * the only text that is not in the fixed content.
 */
export const READING_CONNECTORS = {
    lifeIntro: (branch: string) => `你的命宮在${branch}宮。`,
    bodyIntro: (palace: string, branch: string) => `你的身宮落在${palace}（${branch}宮）。`,
    bodySameAsLife: (branch: string) => `你的身宮與命宮同在${branch}宮，上面的解讀同時適用，這裡不再重複。`,
    hasStar: (palace: string, star: string) => `${palace}有${star}：`,
    strengths: (list: string) => `常見的優勢可能包括${list}。`,
    watch: (list: string) => `可以多留意的是：${list}`,
    transformation: (star: string, transformation: string) => `這裡的${star}帶有生年化${transformation}。`,
    emptyPalace: (palace: string) => `${palace}沒有主星，這是命盤的事實。`,
    borrowed: (palace: string, opposite: string, stars: string) => `以下借用對宮（${opposite}）的${stars}來理解，這是借星，不是${palace}自己的星曜：`,
    nothingToBorrow: (opposite: string) => `對宮（${opposite}）也沒有主星，沒有可以借用的星曜，解讀以宮位的意義為主。`,
} as const;

function need(content: ZiweiContentLookup, key: string): ZiweiReadingContent {
    const found = content(key);

    if (!found) throw new ZiweiContentMissingError(key);

    return found;
}

const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];

function starSentences(
    palaceName: string,
    placements: readonly StarPlacement[],
    content: ZiweiContentLookup,
    prefix: 'star_' | 'aux_',
): ReadingSentence[] {
    const sentences: ReadingSentence[] = [];

    for (const placement of placements) {
        const key = `${prefix}${placement.star}`;
        const text = need(content, key).summary;

        sentences.push({
            text: prefix === 'star_' ? `${READING_CONNECTORS.hasStar(palaceName, placement.star)}${text}` : text,
            contentKeys: [key],
            kind: prefix === 'star_' ? 'star' : 'aux',
        });
    }

    return sentences;
}

function strengthAndWatchSentences(
    stars: readonly ZiweiStar[],
    content: ZiweiContentLookup,
    prefix: 'star_' | 'aux_',
    asBorrowed = false,
): ReadingSentence[] {
    if (stars.length === 0) return [];

    const keys = stars.map((star) => `${prefix}${star}`);
    const bodies = keys.map((key) => need(content, key));
    const strengths = unique(bodies.flatMap((body) => body.strengths));
    // One thing to watch for each star, so a palace with several stars does not become a long list
    const watch = unique(bodies.map((body) => body.blindSpots[0]).filter((item): item is string => Boolean(item)));
    const sentences: ReadingSentence[] = [];

    if (strengths.length > 0) {
        sentences.push({
            text: READING_CONNECTORS.strengths(strengths.join('、')), contentKeys: keys, kind: asBorrowed ? 'borrowed' : 'strengths',
        });
    }

    if (watch.length > 0) {
        sentences.push({
            text: READING_CONNECTORS.watch(watch.join('')), contentKeys: keys, kind: asBorrowed ? 'borrowed' : 'watch',
        });
    }

    return sentences;
}

function transformationSentences(palace: PalaceChart, content: ZiweiContentLookup): ReadingSentence[] {
    return [...palace.mainStars, ...palace.auxiliaryStars].flatMap((placement) => {
        if (placement.transformation === null) return [];

        const key = `transformation_${placement.transformation}`;

        return [
            {
                text: `${READING_CONNECTORS.transformation(placement.star, placement.transformation)}${need(content, key).summary}`,
                contentKeys: [key],
                kind: 'transformation',
            },
        ];
    });
}

function borrowedSentences(palace: Palace, borrowed: BorrowedStars, content: ZiweiContentLookup): ReadingSentence[] {
    if (borrowed.borrowedStars.length === 0) {
        return [
            {
                text: READING_CONNECTORS.nothingToBorrow(borrowed.borrowedFromPalace), contentKeys: [`palace_${palace}`], kind: 'borrowed',
            },
        ];
    }

    const stars = borrowed.borrowedStars.map((placement) => placement.star);
    const intro: ReadingSentence = {
        text: READING_CONNECTORS.borrowed(palace, borrowed.borrowedFromPalace, stars.join('、')),
        contentKeys: stars.map((star) => `star_${star}`),
        kind: 'borrowed',
    };

    return [
        intro,
        ...stars.map((star): ReadingSentence => ({
            text: need(content, `star_${star}`).summary,
            contentKeys: [`star_${star}`],
            kind: 'borrowed',
        })),
        ...strengthAndWatchSentences(stars, content, 'star_', true),
    ];
}

function dedupe(sentences: readonly ReadingSentence[]): ReadingSentence[] {
    const seen = new Set<string>();

    return sentences.filter((sentence) => {
        if (seen.has(sentence.text)) return false;

        seen.add(sentence.text);

        return true;
    });
}

/**
 * The reading of a palace, put together by rules from the palace's context and the readings of the stars that sit in it
 * (not pasted together, and never a content of its own for each star by palace). A palace without a main star keeps
 * that fact and leans on the main stars of the opposite palace, said to be borrowed. The same chart and content always
 * give the same reading. Throws when a reading the palace needs is not available, instead of leaving a gap.
 */
function composePalaceReading(
    chart: ZiweiChart,
    palaceName: Palace,
    kind: PalaceReading['kind'],
    content: ZiweiContentLookup,
): PalaceReading {
    const palace = chart.palaces.find((item) => item.palace === palaceName);

    if (!palace) throw new Error(`Unknown palace: ${palaceName}`);

    const context = need(content, `palace_${palaceName}`);
    const intro = kind === 'LIFE' ? READING_CONNECTORS.lifeIntro(palace.branch) : READING_CONNECTORS.bodyIntro(palaceName, palace.branch);
    const sentences: ReadingSentence[] = [
        {
            text: `${intro}${context.summary}`, contentKeys: [`palace_${palaceName}`], kind: 'context',
        },
    ];
    let borrowed: BorrowedStars | null = null;

    if (palace.isEmpty) {
        sentences.push({
            text: READING_CONNECTORS.emptyPalace(palaceName), contentKeys: [`palace_${palaceName}`], kind: 'empty',
        });
        borrowed = borrowedStarsOf(chart, palaceName);

        if (borrowed) sentences.push(...borrowedSentences(palaceName, borrowed, content));
    } else {
        sentences.push(
            ...starSentences(palaceName, palace.mainStars, content, 'star_'),
            ...strengthAndWatchSentences(palace.mainStars.map((placement) => placement.star), content, 'star_'),
        );
    }

    sentences.push(
        ...starSentences(palaceName, palace.auxiliaryStars, content, 'aux_'),
        ...transformationSentences(palace, content),
        {
            text: context.growthAdvice, contentKeys: [`palace_${palaceName}`], kind: 'advice',
        },
    );

    return {
        kind,
        palace: palaceName,
        sentences: dedupe(sentences),
        borrowed,
    };
}

export function composeLifePalaceReading(chart: ZiweiChart, content: ZiweiContentLookup): PalaceReading {
    return composePalaceReading(chart, '命宮', 'LIFE', content);
}

/**
 * The reading of the body palace. When it is in the life palace there is one palace and one reading, so it only says
 * so instead of repeating the life palace's reading.
 */
export function composeBodyPalaceReading(chart: ZiweiChart, content: ZiweiContentLookup): PalaceReading {
    if (chart.bodyPalace.sameAsLife) {
        return {
            kind: 'BODY',
            palace: '命宮',
            sentences: [
                {
                    text: READING_CONNECTORS.bodySameAsLife(chart.bodyPalace.branch), contentKeys: ['palace_命宮'], kind: 'context',
                },
            ],
            borrowed: null,
        };
    }

    return composePalaceReading(chart, chart.bodyPalace.palace, 'BODY', content);
}

/**
 * The fixed content keys the readings of a chart need: the life palace and the body palace, the stars that sit in them,
 * the 四化 that lands on those stars, and the main stars borrowed by an empty one. A service fetches exactly these,
 * so a report does not wait for all 34 readings, and a missing one is known before anything is composed.
 */
export function ziweiReadingKeys(chart: ZiweiChart): string[] {
    const keys: string[] = [];

    for (const name of unique<Palace>(['命宮', chart.bodyPalace.palace])) {
        const palace = chart.palaces.find((item) => item.palace === name);

        if (!palace) throw new Error(`Unknown palace: ${name}`);

        keys.push(`palace_${name}`);

        for (const placement of palace.mainStars) keys.push(`star_${placement.star}`);

        for (const placement of palace.auxiliaryStars) keys.push(`aux_${placement.star}`);

        for (const placement of [...palace.mainStars, ...palace.auxiliaryStars]) {
            if (placement.transformation !== null) keys.push(`transformation_${placement.transformation}`);
        }

        for (const placement of borrowedStarsOf(chart, name)?.borrowedStars ?? []) keys.push(`star_${placement.star}`);
    }

    return unique(keys);
}
