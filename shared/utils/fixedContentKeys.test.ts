import {
    describe, expect, it,
} from 'vitest';
import { assessmentContentKeys } from '../assessments';
import {
    baziContentKeys,
    expectedFixedContentIds,
    fixedContentId,
    isValidContentKey,
    kinContentKeys,
    tarotContentKeys,
} from './fixedContentKeys';
import { ziweiContentKeys } from '../constants/ziwei';

describe('isValidContentKey', () => {
    it('validates each content type', () => {
        expect(isValidContentKey('ZODIAC', 'aries')).toBe(true);
        expect(isValidContentKey('ZODIAC', 'INTJ')).toBe(false);
        expect(isValidContentKey('BLOOD', 'AB')).toBe(true);
        expect(isValidContentKey('BLOOD', 'UNKNOWN')).toBe(false);
        expect(isValidContentKey('MBTI', 'INTJ')).toBe(true);
        expect(isValidContentKey('NUMEROLOGY', '11')).toBe(true);
        expect(isValidContentKey('NUMEROLOGY', '10')).toBe(false);
    });

    it('accepts the legal BAZI keys', () => {
        for (const key of [
            'daymaster_甲',
            'element_strong_wood',
            'element_missing_water',
            'group_dominant_resource',
            'month_寅',
            'luck_偏印',
            'strength_taiwang',
            'pattern_建祿',
            'useful_strong',
            'useful_weak',
            'bone_21',
            'bone_71',
            'reveal_main',
            'rival_power',
            'idle_resource',
            'climate_excess_warming',
            'life_career_power',
            'life_wealth_balanced',
        ]) {
            expect(isValidContentKey('BAZI', key), key).toBe(true);
        }
    });

    it('rejects illegal BAZI keys', () => {
        for (const key of [
            'daymaster_子',
            'daymaster_',
            'group_dominant_other',
            'element_missing_air',
            'month_甲',
            'luck_好運',
            'strength_strongest',
            'pattern_比肩',
            'useful_strong_other',
            'useful_balanced',
            'useful_strong_印',
            'useful_weak_官殺',
            'bone_20',
            'bone_72',
            'bone_021',
            'bone_4.1',
            'aries',
            'life_health_power',
            'life_career_other',
            'life_career_',
            'reveal_all',
            'rival_balanced',
            'climate_humid',
        ]) {
            expect(isValidContentKey('BAZI', key), key).toBe(false);
        }
    });
});

describe('ASSESSMENT keys', () => {
    it('are the keys of the registry: every one is legal, and one that is in no definition is not', () => {
        for (const key of assessmentContentKeys()) expect(isValidContentKey('ASSESSMENT', key), key).toBe(true);

        expect(isValidContentKey('ASSESSMENT', 'enneagram_type-99-nope')).toBe(false);
        expect(isValidContentKey('ASSESSMENT', '')).toBe(false);
    });

    it('are all expected before the contents are complete', () => {
        const ids = expectedFixedContentIds().filter((id) => id.startsWith('ASSESSMENT_'));

        expect(ids).toHaveLength(assessmentContentKeys().length);
    });
});

describe('TAROT keys', () => {
    it('accepts every card in both orientations', () => {
        expect(tarotContentKeys()).toHaveLength(44);
        expect(isValidContentKey('TAROT', '0_upright')).toBe(true);
        expect(isValidContentKey('TAROT', '13_reversed')).toBe(true);
        expect(isValidContentKey('TAROT', '21_upright')).toBe(true);

        for (const key of tarotContentKeys()) expect(isValidContentKey('TAROT', key), key).toBe(true);
    });

    it('rejects cards outside the major arcana and malformed keys', () => {
        for (const key of [
            '22_upright',
            '-1_upright',
            '3_sideways',
            '03_upright',
            '3',
            'upright',
            '3_upright_extra',
            'aries',
        ]) {
            expect(isValidContentKey('TAROT', key), key).toBe(false);
        }
    });
});

describe('KIN keys', () => {
    it.each(['KIN_BIRTH', 'KIN_TODAY'] as const)('%s accepts 1 to 260', (type) => {
        expect(kinContentKeys()).toHaveLength(260);
        expect(isValidContentKey(type, '1')).toBe(true);
        expect(isValidContentKey(type, '207')).toBe(true);
        expect(isValidContentKey(type, '260')).toBe(true);

        for (const key of kinContentKeys()) expect(isValidContentKey(type, key), key).toBe(true);
    });

    it.each(['KIN_BIRTH', 'KIN_TODAY'] as const)('%s rejects keys outside 1 to 260 and malformed ones', (type) => {
        for (const key of [
            '0',
            '261',
            '-1',
            '01',
            '1.5',
            '',
            'one',
            '1_upright',
            ' 7',
        ]) {
            expect(isValidContentKey(type, key), key).toBe(false);
        }
    });
});

describe('HEXAGRAM keys', () => {
    it('accepts a hexagram as its number and a line as its number and position', () => {
        for (const key of [
            '1',
            '12',
            '64',
            '12_3',
            '1_1',
            '64_6',
        ]) expect(isValidContentKey('HEXAGRAM', key), key).toBe(true);
    });

    it('rejects a number outside 1 to 64, a position outside 1 to 6 and anything that is not written that way', () => {
        for (const key of [
            '0',
            '65',
            '012',
            '1_0',
            '12_7',
            '64_7',
            '1_',
            '_1',
            '1_1_1',
            'a',
            '1 ',
            '1.0',
            '',
        ]) expect(isValidContentKey('HEXAGRAM', key), key).toBe(false);
    });
});

describe('ZIWEI keys', () => {
    it('has 34 keys: 14 main stars, 4 auxiliary stars, 12 palaces and the four 四化', () => {
        const keys = ziweiContentKeys();

        expect(keys).toHaveLength(34);
        expect(new Set(keys).size).toBe(34);
        expect(keys.filter((key) => key.startsWith('star_'))).toHaveLength(14);
        expect(keys.filter((key) => key.startsWith('aux_'))).toHaveLength(4);
        expect(keys.filter((key) => key.startsWith('palace_'))).toHaveLength(12);
        expect(keys.filter((key) => key.startsWith('transformation_'))).toHaveLength(4);
    });

    it('accepts every key of the list', () => {
        for (const key of ziweiContentKeys()) expect(isValidContentKey('ZIWEI', key), key).toBe(true);
        expect(isValidContentKey('ZIWEI', 'star_紫微')).toBe(true);
        expect(isValidContentKey('ZIWEI', 'aux_文昌')).toBe(true);
        expect(isValidContentKey('ZIWEI', 'palace_命宮')).toBe(true);
        expect(isValidContentKey('ZIWEI', 'transformation_忌')).toBe(true);
    });

    it('rejects a star that is not placed, a wrong prefix, a star by palace combination and anything else', () => {
        for (const key of [
            'star_文昌',
            'aux_紫微',
            'star_祿存',
            'palace_身宮',
            'palace_財帛宮',
            'transformation_祿存',
            'star_紫微_命宮',
            'palace_命宮_紫微',
            '紫微',
            'star_',
            '',
        ]) expect(isValidContentKey('ZIWEI', key), key).toBe(false);
    });

    it('is not a legal key of any other content type', () => {
        expect(isValidContentKey('BAZI', 'star_紫微')).toBe(false);
        expect(isValidContentKey('HEXAGRAM', 'palace_命宮')).toBe(false);
    });

    it('is listed among the ids that must exist before launch', () => {
        const ids = expectedFixedContentIds().filter((id) => id.startsWith('ZIWEI_'));

        expect(ids).toHaveLength(34);
        expect(ids).toContain(fixedContentId('ZIWEI', 'star_紫微'));
    });
});

describe('RUNE keys', () => {
    it('accepts every rune upright, and reversed only for the ones that can be reversed', () => {
        expect(isValidContentKey('RUNE', '0_upright')).toBe(true);
        // Fehu can be reversed
        expect(isValidContentKey('RUNE', '0_reversed')).toBe(true);
        // Gebo looks the same upside down: upright only
        expect(isValidContentKey('RUNE', '6_upright')).toBe(true);
        expect(isValidContentKey('RUNE', '6_reversed')).toBe(false);
        expect(isValidContentKey('RUNE', '23_reversed')).toBe(true);
    });

    it('rejects every reversed key of the nine symmetric runes', () => {
        for (const index of [
            6,
            8,
            9,
            10,
            11,
            12,
            15,
            21,
            22,
        ]) {
            expect(isValidContentKey('RUNE', `${index}_upright`), `${index} upright`).toBe(true);
            expect(isValidContentKey('RUNE', `${index}_reversed`), `${index} reversed`).toBe(false);
        }
    });

    it('rejects runes outside the 24 and malformed keys', () => {
        for (const key of [
            '24_upright',
            '-1_upright',
            '3_sideways',
            '03_upright',
            '3',
            'upright',
            '3_upright_extra',
        ]) {
            expect(isValidContentKey('RUNE', key), key).toBe(false);
        }
    });
});

describe('HOROSCOPE keys', () => {
    it('accepts the five bodies in each of the twelve houses', () => {
        expect(isValidContentKey('HOROSCOPE', 'MOON_5')).toBe(true);
        expect(isValidContentKey('HOROSCOPE', 'VENUS_12')).toBe(true);
        expect(isValidContentKey('HOROSCOPE', 'SUN_1')).toBe(true);
        expect(isValidContentKey('HOROSCOPE', 'MARS_7')).toBe(true);
        expect(isValidContentKey('HOROSCOPE', 'MERCURY_3')).toBe(true);
    });

    it('rejects other bodies, houses out of 1 to 12 and malformed keys', () => {
        for (const key of [
            'MOON_0',
            'MOON_13',
            'MOON_05',
            'JUPITER_1',
            'SATURN_4',
            'MOON-5',
            'MOON_',
            'moon_5',
            '5',
            'MOON_5_extra',
        ]) {
            expect(isValidContentKey('HOROSCOPE', key), key).toBe(false);
        }
    });
});

describe('baziContentKeys', () => {
    const keys = baziContentKeys();
    const countOf = (prefix: string) => keys.filter((key) => key.startsWith(prefix)).length;

    it('lists 170 distinct keys', () => {
        expect(keys).toHaveLength(170);
        expect(new Set(keys).size).toBe(170);
    });

    it('splits them into the content groups', () => {
        expect(countOf('daymaster_')).toBe(10);
        expect(countOf('element_strong_')).toBe(5);
        expect(countOf('element_missing_')).toBe(5);
        expect(countOf('group_dominant_')).toBe(5);
        expect(countOf('month_')).toBe(12);
        expect(countOf('luck_')).toBe(10);
        expect(countOf('strength_')).toBe(5);
        expect(countOf('pattern_')).toBe(10);
        expect(countOf('useful_')).toBe(2);
        expect(countOf('bone_')).toBe(51);
        expect(countOf('reveal_')).toBe(3);
        expect(countOf('rival_')).toBe(5);
        expect(countOf('idle_')).toBe(5);
        expect(countOf('climate_')).toBe(6);
        expect(countOf('life_')).toBe(36);
    });

    it('is valid for every key it lists', () => {
        for (const key of keys) expect(isValidContentKey('BAZI', key), key).toBe(true);
    });
});

describe('expectedFixedContentIds', () => {
    const ids = expectedFixedContentIds();

    it('lists 44 single results, 170 BaZi contents and 44 tarot contents, 520 Kin contents and 39 rune contents and 60 sign horoscope contents and 448 hexagram readings and 34 Zi Wei readings and the self-assessment contents, all unique', () => {
        expect(ids).toHaveLength(1526);
        expect(new Set(ids).size).toBe(1526);
        expect(ids.filter((id) => id.startsWith('ZODIAC_'))).toHaveLength(12);
        expect(ids.filter((id) => id.startsWith('BLOOD_'))).toHaveLength(4);
        expect(ids.filter((id) => id.startsWith('MBTI_'))).toHaveLength(16);
        expect(ids.filter((id) => id.startsWith('NUMEROLOGY_'))).toHaveLength(12);
        expect(ids.filter((id) => id.startsWith('BAZI_'))).toHaveLength(170);
        expect(ids.filter((id) => id.startsWith('TAROT_'))).toHaveLength(44);
        expect(ids.filter((id) => id.startsWith('KIN_BIRTH_'))).toHaveLength(260);
        expect(ids.filter((id) => id.startsWith('KIN_TODAY_'))).toHaveLength(260);
        expect(ids.filter((id) => id.startsWith('RUNE_'))).toHaveLength(39);
        expect(ids.filter((id) => id.startsWith('HOROSCOPE_'))).toHaveLength(60);
        expect(ids.filter((id) => id.startsWith('HEXAGRAM_'))).toHaveLength(448);
        expect(ids.filter((id) => id.startsWith('ZIWEI_'))).toHaveLength(34);
    });

    it('uses the same id format as fixedContentId', () => {
        expect(ids).toContain(fixedContentId('ZODIAC', 'aries'));
    });
});
