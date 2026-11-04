import {
    describe, expect, it, vi,
} from 'vitest';
import {
    createPreviewLoader, previewKeyOf,
} from './homePreview';
import { lifePathNumber } from '../../shared/utils/numerology';

const ANSWER = {
    zodiac: {
        title: '牡羊座', summary: '直接而有行動力',
    },
    numerology: {
        title: '生命靈數 7', summary: '喜歡獨立思考',
    },
};

describe('previewKeyOf', () => {
    it('is the sign and the life path number of a real date', () => {
        expect(previewKeyOf('1990-03-25')).toEqual({
            sign: 'aries', lifePath: String(lifePathNumber('1990-03-25')),
        });
    });

    it('keeps a master number as it is', () => {
        expect(previewKeyOf('1992-11-29')?.lifePath).toBe(String(lifePathNumber('1992-11-29')));
    });

    it.each([
        ['empty', ''],
        ['missing', null],
        ['half filled in', '1990-03'],
        ['not a date', 'hello'],
        ['not a real day', '2023-02-31'],
    ])('is null for a date that is %s', (_name, value) => {
        expect(previewKeyOf(value)).toBeNull();
    });
});

describe('createPreviewLoader', () => {
    const key = {
        sign: 'aries' as const, lifePath: '7',
    };

    it('asks once and keeps the answer', async () => {
        const fetcher = vi.fn(async () => ANSWER);
        const loader = createPreviewLoader(fetcher);

        expect(await loader.load(key)).toEqual(ANSWER);
        expect(await loader.load(key)).toEqual(ANSWER);
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('asks again for a different key', async () => {
        const fetcher = vi.fn(async () => ANSWER);
        const loader = createPreviewLoader(fetcher);

        await loader.load(key);
        await loader.load({
            sign: 'taurus', lifePath: '7',
        });

        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('lets two asks at the same time share one request', async () => {
        const fetcher = vi.fn(async () => ANSWER);
        const loader = createPreviewLoader(fetcher);

        await Promise.all([loader.load(key), loader.load(key)]);

        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('sends only the sign and the life path number', async () => {
        const fetcher = vi.fn(async (_key: unknown) => ANSWER);

        await createPreviewLoader(fetcher).load({
            ...key, birthDate: '1990-03-25',
        } as typeof key);

        expect(fetcher).toHaveBeenCalledWith({
            sign: 'aries', lifePath: '7',
        });
    });

    it('gives null when the request fails, and tries again the next time it is asked', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const fetcher = vi.fn()
            .mockRejectedValueOnce(Object.assign(new Error('Too many requests'), { statusCode: 429 }))
            .mockResolvedValueOnce(ANSWER);
        const loader = createPreviewLoader(fetcher);

        expect(await loader.load(key)).toBeNull();
        expect(await loader.load(key)).toEqual(ANSWER);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('gives null for an answer of the wrong shape', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        expect(await createPreviewLoader(async () => ({ zodiac: 'oops' })).load(key)).toBeNull();
    });

    it('passes on a line the server left out as null', async () => {
        const answer = {
            zodiac: ANSWER.zodiac, numerology: null,
        };

        expect(await createPreviewLoader(async () => answer).load(key)).toEqual(answer);
    });
});
