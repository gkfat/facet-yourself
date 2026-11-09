import {
    beforeEach, describe, expect, it,
} from 'vitest';
import type { Firestore } from 'firebase-admin/firestore';
import { FakeFirestore } from '../../server/test-utils/fakeFirestore';
import {
    applyFixedContent, sameContent,
} from './applyFixedContent';
import type { ImportRow } from '../../shared/utils/fixedContentImport';

const body = {
    title: '標題',
    summary: '摘要',
    strengths: [],
    blindSpots: [],
    loveStyle: '',
    workStyle: '',
    communicationStyle: '',
    growthAdvice: '',
    disclaimer: '僅供娛樂與自我探索',
};

const row = (overrides: Partial<ImportRow> = {}): ImportRow => ({
    contentType: 'ZODIAC',
    key: 'aries',
    body,
    status: 'DRAFT',
    ...overrides,
});

describe('applyFixedContent', () => {
    let db: FakeFirestore;
    const asFirestore = () => db as unknown as Firestore;

    beforeEach(() => {
        db = new FakeFirestore();
    });

    it('creates the document with a deterministic id and version 1', async () => {
        const outcome = await applyFixedContent(asFirestore(), [row()], 1000);

        expect(outcome.created).toEqual(['ZODIAC_aries']);

        const stored = (await db.doc('fixedContents/ZODIAC_aries').get()).data();
        expect(stored).toMatchObject({
            contentVersion: '1',
            status: 'DRAFT',
            publishedAt: null,
        });
    });

    it('does not duplicate a combination when imported again', async () => {
        await applyFixedContent(asFirestore(), [row()], 1000);
        const second = await applyFixedContent(asFirestore(), [row()], 2000);

        expect(second.unchanged).toEqual(['ZODIAC_aries']);
        expect(db.paths()).toHaveLength(1);
        expect((await db.doc('fixedContents/ZODIAC_aries').get()).data()?.contentVersion).toBe('1');
    });

    it('does not count a body whose fields come back in another order as a change', async () => {
        await applyFixedContent(asFirestore(), [row()], 1000);

        // Firestore returns a map with its fields sorted; write the stored body that way
        const sorted = Object.fromEntries(Object.entries(body).sort(([a], [b]) => a.localeCompare(b)));
        const ref = db.doc('fixedContents/ZODIAC_aries');

        await ref.set({
            ...(await ref.get()).data(), body: sorted,
        });

        const again = await applyFixedContent(asFirestore(), [row()], 2000);

        expect(again.unchanged).toEqual(['ZODIAC_aries']);
        expect((await ref.get()).data()?.contentVersion).toBe('1');
    });

    it('bumps the version when the body changes', async () => {
        await applyFixedContent(asFirestore(), [row()], 1000);
        const outcome = await applyFixedContent(asFirestore(), [
            row({
                body: {
                    ...body, summary: '新的摘要',
                },
            }),
        ], 2000);

        expect(outcome.updated).toEqual(['ZODIAC_aries']);
        expect((await db.doc('fixedContents/ZODIAC_aries').get()).data()?.contentVersion).toBe('2');
    });

    it('sets publishedAt on publication and keeps the first publication time', async () => {
        await applyFixedContent(asFirestore(), [row({ status: 'PUBLISHED' })], 1000);
        expect((await db.doc('fixedContents/ZODIAC_aries').get()).data()?.publishedAt).toBe(1000);

        await applyFixedContent(asFirestore(), [
            row({
                status: 'PUBLISHED',
                body: {
                    ...body, summary: '修訂',
                },
            }),
        ], 2000);
        expect((await db.doc('fixedContents/ZODIAC_aries').get()).data()?.publishedAt).toBe(1000);
    });

    it('clears publishedAt when content goes back to draft', async () => {
        await applyFixedContent(asFirestore(), [row({ status: 'PUBLISHED' })], 1000);
        await applyFixedContent(asFirestore(), [row({ status: 'DRAFT' })], 2000);

        expect((await db.doc('fixedContents/ZODIAC_aries').get()).data()?.publishedAt).toBeNull();
    });
});

describe('sameContent', () => {
    it('ignores the order of the fields of an object, at any depth', () => {
        expect(sameContent({
            a: 1, b: {
                c: 2, d: [
                    {
                        e: 1, f: 2, 
                    },
                ], 
            },
        }, {
            b: {
                d: [
                    {
                        f: 2, e: 1, 
                    },
                ], c: 2, 
            }, a: 1,
        })).toBe(true);
    });

    it('keeps the order of a list', () => {
        expect(sameContent(['a', 'b'], ['b', 'a'])).toBe(false);
    });

    it('sees a different value, a missing field and an extra field', () => {
        expect(sameContent({ a: 1 }, { a: 2 })).toBe(false);
        expect(sameContent({
            a: 1, b: 2, 
        }, { a: 1 })).toBe(false);
        expect(sameContent({ a: 1 }, {
            a: 1, b: 2, 
        })).toBe(false);
        expect(sameContent({ a: undefined }, { b: undefined })).toBe(false);
    });

    it('tells an empty list, an empty object and null apart', () => {
        expect(sameContent([], {})).toBe(false);
        expect(sameContent(null, {})).toBe(false);
        expect(sameContent('', null)).toBe(false);
    });
});
