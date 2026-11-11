import { ZIWEI_DISCLAIMER } from '../constants/ziweiLabels.ts';
import {
    ASSERTION_WORDS, FORBIDDEN_ADVICE_WORDS,
} from '../ontology/fragments/fragments.ts';

/**
 * Words the Zi Wei readings written for this site must not use, on top of the site-wide lists (medical, legal and money
 * advice, and wording that states something as certain). A chart is a symbolic reading for self-exploration: no verdicts
 * of luck, no talk of lifespan, no promise or warning of an event, no money forecast. The bare character 必 is banned as
 * the specification says; write 一定要 or 需要 instead.
 */
const ZIWEI_OWN_FORBIDDEN_WORDS: readonly string[] = [
    // Verdicts of luck
    '大凶',
    '吉凶',
    '不吉',
    '凶險',
    '災禍',
    '災難',
    '厄運',
    '劫數',
    '不幸',
    '倒楣',
    '壞事',
    // Lifespan and kinship curses
    '早逝',
    '夭折',
    '短命',
    '壽命',
    '剋夫',
    '剋妻',
    '命苦',
    // Certainty
    '必',
    // Money forecasts
    '破財',
    '財運',
    '發財',
    '賺錢',
    '橫財',
    // Warnings of an event
    '官非',
    '血光',
    '意外',
    // 文昌 and 文曲 transformed to 忌 is not an exam or speech verdict
    '考運',
    '落榜',
];

export const ZIWEI_FORBIDDEN_WORDS: readonly string[] = [
    ...new Set([
        ...FORBIDDEN_ADVICE_WORDS,
        ...ASSERTION_WORDS,
        ...ZIWEI_OWN_FORBIDDEN_WORDS,
    ]),
];

/** A reading speaks of tendencies: at least one of these has to be in it. */
export const ZIWEI_HEDGE_WORDS: readonly string[] = [
    '可能',
    '傾向',
    '象徵',
];

/** 化忌 is described as something that is hard to let go of and worth watching, never as a calamity. */
export const ZIWEI_JI_REQUIRED_PHRASES: readonly string[] = ['放不下', '留意'];

export const ZIWEI_JI_KEY = 'transformation_忌';

export { ZIWEI_DISCLAIMER };

/** The forbidden words found in a text, each once, in the order of the list. */
export function findForbiddenZiweiWords(text: string): string[] {
    return ZIWEI_FORBIDDEN_WORDS.filter((word) => text.includes(word));
}

/** Everything wrong with the wording of one Zi Wei reading, as plain sentences; empty when it is sound. */
export function findZiweiWordingIssues(key: string, text: string): string[] {
    const issues: string[] = [];
    const forbidden = findForbiddenZiweiWords(text);

    if (forbidden.length > 0) issues.push(`a Zi Wei reading must not use: ${forbidden.join('、')}`);

    if (!ZIWEI_HEDGE_WORDS.some((word) => text.includes(word))) {
        issues.push(`a Zi Wei reading has to speak of tendencies (${ZIWEI_HEDGE_WORDS.join('、')})`);
    }

    if (key === ZIWEI_JI_KEY) {
        const missing = ZIWEI_JI_REQUIRED_PHRASES.filter((phrase) => !text.includes(phrase));

        if (missing.length > 0) {
            issues.push(`化忌 has to be described as something hard to let go of and worth watching; missing: ${missing.join('、')}`);
        }
    }

    return issues;
}
