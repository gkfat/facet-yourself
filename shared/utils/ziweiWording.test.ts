import {
    describe, expect, it,
} from 'vitest';
import {
    ZIWEI_FORBIDDEN_WORDS,
    findForbiddenZiweiWords,
    findZiweiWordingIssues,
} from './ziweiWording';

describe('findForbiddenZiweiWords', () => {
    it('finds the Zi Wei specific words the specification names', () => {
        for (const word of [
            '大凶',
            '早逝',
            '必',
            '破財',
        ]) expect(findForbiddenZiweiWords(`這裡寫了${word}這個詞`), word).toContain(word);
    });

    it('also carries the site-wide lists of medical, money and certainty wording', () => {
        for (const word of [
            '診斷',
            '投資',
            '一定會',
            '注定',
        ]) expect(ZIWEI_FORBIDDEN_WORDS, word).toContain(word);
    });

    it('lists each word once and finds nothing in a tentative sentence', () => {
        expect(findForbiddenZiweiWords('你可能傾向先觀察再行動，也容易想得很細。')).toEqual([]);
        expect(findForbiddenZiweiWords('大凶大凶')).toEqual(['大凶']);
        expect(new Set(ZIWEI_FORBIDDEN_WORDS).size).toBe(ZIWEI_FORBIDDEN_WORDS.length);
    });
});

describe('findZiweiWordingIssues', () => {
    it('accepts a tentative reading', () => {
        expect(findZiweiWordingIssues('star_紫微', '你可能傾向把事情看得很大，也願意負責。')).toEqual([]);
    });

    it('rejects a forbidden word and names it', () => {
        const issues = findZiweiWordingIssues('star_紫微', '你可能會遇到破財的事。');

        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('破財');
    });

    it('rejects a reading that does not speak of tendencies', () => {
        expect(findZiweiWordingIssues('star_紫微', '你很有領導力。').join()).toContain('tendencies');
    });

    it('requires 化忌 to be described as hard to let go of and worth watching', () => {
        expect(findZiweiWordingIssues('transformation_忌', '你可能傾向對某件事放不下，值得多留意自己的反應。')).toEqual([]);
        expect(findZiweiWordingIssues('transformation_忌', '你可能傾向對某件事放不下。').join()).toContain('留意');
        expect(findZiweiWordingIssues('transformation_忌', '你可能傾向多留意。').join()).toContain('放不下');
    });

    it('does not ask the other 四化 for that wording', () => {
        expect(findZiweiWordingIssues('transformation_祿', '你可能傾向在這件事上得到不錯的回饋。')).toEqual([]);
    });

    it('rejects a 化忌 written as a calamity or an exam verdict', () => {
        expect(findZiweiWordingIssues('transformation_忌', '可能放不下而需要留意，有災難的預兆。').join()).toContain('災難');
        expect(findZiweiWordingIssues('transformation_忌', '文昌化忌可能放不下，留意考運。').join()).toContain('考運');
    });
});
