/**
 * Words the plain-language readings of the hexagrams must not use. A cast is the state of one moment, not a
 * prediction, so a reading never says a thing is lucky or unlucky for certain, never promises or foretells an event,
 * and never gives clinical or money advice. The classical text itself says "吉" and "凶" and is kept as it is
 * (see `hexagramTexts.ts`); this only applies to the readings written for this site.
 */
export const HEXAGRAM_FORBIDDEN_WORDS = [
    // Verdicts of luck
    '大吉',
    '大凶',
    '吉凶',
    '不吉',
    '凶險',
    '兇險',
    '災禍',
    '災難',
    '厄運',
    '劫數',
    // Certainty about what will happen
    '必定',
    '一定會',
    '肯定會',
    '注定',
    '保證',
    '絕對',
    // Clinical wording
    '診斷',
    '治療',
    '疾病',
    '病態',
    '障礙',
    '憂鬱',
    '患者',
    // Money advice
    '投資',
    '股票',
    '賺錢',
    '發財',
] as const;

/** The forbidden words found in a text, each once, in the order of the list. */
export function findForbiddenHexagramWords(text: string): string[] {
    return HEXAGRAM_FORBIDDEN_WORDS.filter((word) => text.includes(word));
}
