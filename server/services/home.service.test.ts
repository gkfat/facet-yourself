import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import {
    HomeService, PreviewCache,
} from './home.service';
import { FixedContentService } from './fixedContent.service';
import { homePreviewResponseSchema } from '../../shared/schemas/api/home.schema';

const holder = vi.hoisted(() => ({ db: undefined as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));

function contentDoc(type: string, key: string, status = 'PUBLISHED') {
    return {
        contentType: type,
        key,
        body: {
            title: `${type} ${key}`,
            summary: `summary of ${type} ${key}`,
            disclaimer: '僅供娛樂與自我探索',
            strengths: ['a long field the preview must not carry'],
        },
        contentVersion: '1',
        status,
        updatedAt: 1,
        publishedAt: status === 'PUBLISHED' ? 1 : null,
    };
}

describe('HomeService', () => {
    let db: FakeFirestore;
    let clock: { now: number };
    let content: FixedContentService;
    let service: HomeService;

    const publish = async (type: string, key: string, status = 'PUBLISHED') => {
        await db.doc(`fixedContents/${type}_${key}`).set(contentDoc(type, key, status));
    };

    beforeEach(() => {
        db = new FakeFirestore();
        holder.db = db;
        clock = { now: 1_000_000 };
        content = new FixedContentService();
        // A cache of its own: the shared one would carry answers from one test into the next
        service = new HomeService({
            content, cache: new PreviewCache(() => clock.now),
        });
    });

    it('gives the title and summary of both, and nothing else of the content', async () => {
        await publish('ZODIAC', 'aries');
        await publish('NUMEROLOGY', '7');

        const response = homePreviewResponseSchema.parse(await service.preview({
            sign: 'aries', lifePath: '7',
        }));

        expect(response).toEqual({
            zodiac: {
                title: 'ZODIAC aries', summary: 'summary of ZODIAC aries',
            },
            numerology: {
                title: 'NUMEROLOGY 7', summary: 'summary of NUMEROLOGY 7',
            },
        });
    });

    it('leaves out what was not asked for', async () => {
        await publish('ZODIAC', 'aries');

        expect(await service.preview({ sign: 'aries' })).toEqual({
            zodiac: {
                title: 'ZODIAC aries', summary: 'summary of ZODIAC aries',
            },
            numerology: null,
        });
    });

    it('gives null for a line that is not published without failing the other', async () => {
        await publish('ZODIAC', 'aries');
        await publish('NUMEROLOGY', '7', 'DRAFT');

        const response = await service.preview({
            sign: 'aries', lifePath: '7',
        });

        expect(response.zodiac).not.toBeNull();
        expect(response.numerology).toBeNull();
    });

    it('does not read the store again for what it has, and does not call beforeRead', async () => {
        await publish('ZODIAC', 'aries');

        const read = vi.spyOn(content, 'getPublished');
        const beforeRead = vi.fn(async () => undefined);

        await service.preview({ sign: 'aries' }, beforeRead);
        await service.preview({ sign: 'aries' }, beforeRead);
        await service.preview({ sign: 'aries' }, beforeRead);

        expect(read).toHaveBeenCalledTimes(1);
        expect(beforeRead).toHaveBeenCalledTimes(1);
    });

    it('calls beforeRead once for several lines that have to be read', async () => {
        await publish('ZODIAC', 'aries');
        await publish('NUMEROLOGY', '7');

        const beforeRead = vi.fn(async () => undefined);

        await service.preview({
            sign: 'aries', lifePath: '7',
        }, beforeRead);

        expect(beforeRead).toHaveBeenCalledTimes(1);
    });

    it('reads only what is missing when part of it is cached', async () => {
        await publish('ZODIAC', 'aries');
        await publish('NUMEROLOGY', '7');
        await service.preview({ sign: 'aries' });

        const read = vi.spyOn(content, 'getPublished');

        await service.preview({
            sign: 'aries', lifePath: '7',
        });

        expect(read).toHaveBeenCalledTimes(1);
        expect(read).toHaveBeenCalledWith('NUMEROLOGY', '7');
    });

    it('reads nothing when beforeRead refuses', async () => {
        await publish('ZODIAC', 'aries');

        const read = vi.spyOn(content, 'getPublished');

        await expect(service.preview({ sign: 'aries' }, async () => {
            throw new Error('limited');
        })).rejects.toThrow('limited');
        expect(read).not.toHaveBeenCalled();
    });

    it('remembers a line that is not published, but only briefly', async () => {
        const read = vi.spyOn(content, 'getPublished');

        await service.preview({ sign: 'aries' });
        await service.preview({ sign: 'aries' });
        expect(read).toHaveBeenCalledTimes(1);

        // Published in the meantime, and the short memory has run out
        await publish('ZODIAC', 'aries');
        clock.now += 61 * 1000;

        expect((await service.preview({ sign: 'aries' })).zodiac).not.toBeNull();
        expect(read).toHaveBeenCalledTimes(2);
    });

    it('keeps a published line longer, then reads it again', async () => {
        await publish('ZODIAC', 'aries');

        const read = vi.spyOn(content, 'getPublished');

        await service.preview({ sign: 'aries' });
        clock.now += 9 * 60 * 1000;
        await service.preview({ sign: 'aries' });
        expect(read).toHaveBeenCalledTimes(1);

        clock.now += 2 * 60 * 1000;
        await service.preview({ sign: 'aries' });
        expect(read).toHaveBeenCalledTimes(2);
    });

    it('lets any other failure through and does not remember it', async () => {
        const read = vi.spyOn(content, 'getPublished').mockRejectedValueOnce(new Error('store down'));

        await expect(service.preview({ sign: 'aries' })).rejects.toThrow('store down');

        await publish('ZODIAC', 'aries');
        read.mockRestore();

        expect((await service.preview({ sign: 'aries' })).zodiac).not.toBeNull();
    });
});
