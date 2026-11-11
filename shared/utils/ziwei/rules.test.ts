import {
    describe, expect, it,
} from 'vitest';
import {
    BRANCHES, STEMS,
} from '../../constants/bazi';
import {
    AUXILIARY_PLACEMENT,
    AUXILIARY_STARS,
    BIRTH_YEAR_TRANSFORMATIONS,
    BODY_MASTER_BY_BRANCH,
    LIFE_MASTER_BY_LIFE_BRANCH,
    MAIN_STARS,
    PALACES,
    type RuleVerification,
} from '../../constants/ziwei';
import {
    ZIWEI_RULE_VERIFICATIONS,
    UnverifiedRulesError,
    assertRulesVerified,
    unverifiedRules,
    type ZiweiRuleName,
} from './rules';

const KNOWN_STARS: readonly string[] = [...MAIN_STARS, ...AUXILIARY_STARS];

describe('Zi Wei constants', () => {
    it('has fourteen main stars, four auxiliary stars and twelve palaces', () => {
        expect(MAIN_STARS).toHaveLength(14);
        expect(AUXILIARY_STARS).toHaveLength(4);
        expect(PALACES).toHaveLength(12);
    });

    it('gives every year stem four distinct known stars', () => {
        for (const stem of STEMS) {
            const stars = BIRTH_YEAR_TRANSFORMATIONS[stem];

            expect(new Set(stars).size).toBe(4);
            for (const star of stars) expect(KNOWN_STARS).toContain(star);
        }
    });

    it('covers all twelve branches for the life master and the body master', () => {
        for (const branch of BRANCHES) {
            expect(LIFE_MASTER_BY_LIFE_BRANCH[branch]).toBeTruthy();
            expect(BODY_MASTER_BY_BRANCH[branch]).toBeTruthy();
        }
    });

    it('defines a placement for every auxiliary star', () => {
        for (const star of AUXILIARY_STARS) expect(AUXILIARY_PLACEMENT[star]).toBeDefined();
    });
});

describe('rule verification guard', () => {
    function withPending(rule: ZiweiRuleName): Record<ZiweiRuleName, RuleVerification> {
        return {
            ...ZIWEI_RULE_VERIFICATIONS,
            [rule]: {
                ...ZIWEI_RULE_VERIFICATIONS[rule],
                status: 'pending' as const,
            },
        };
    }

    it('has every rule table verified, so the chart flow runs', () => {
        expect(unverifiedRules()).toEqual([]);
        expect(() => assertRulesVerified()).not.toThrow();
    });

    it('records where each verification comes from, never claiming a book page', () => {
        for (const verification of Object.values(ZIWEI_RULE_VERIFICATIONS)) {
            expect(verification.status).toBe('verified');
            expect(verification.sourceBook).toContain('iztro');
            expect(verification.page).toBeNull();
            expect(verification.notes).toContain('no other user-confirmed charts');
        }
    });

    it('lists a table that is not verified', () => {
        expect(unverifiedRules(withPending('lifeMaster'))).toEqual(['lifeMaster']);
    });

    it('refuses to run when any table is pending and names it', () => {
        expect(() => assertRulesVerified(withPending('birthYearTransformations'))).toThrow(UnverifiedRulesError);
        expect(() => assertRulesVerified(withPending('birthYearTransformations'))).toThrow(/birthYearTransformations/);
    });
});
