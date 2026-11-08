import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { FakeFirestore } from '../test-utils/fakeFirestore';
import {
    BusinessLogicError, NotFoundError, ValidationError,
} from '../../shared/types/errors';
import type {
    AuthAccount, AuthDirectory,
} from '../utils/firebaseAuthDirectory';

const holder = vi.hoisted(() => ({ db: null as unknown }));

vi.mock('../utils/firebaseAdmin', () => ({ getAdminFirestore: () => holder.db }));
vi.mock('./deletion.service', () => ({ DeletionService: vi.fn() }));
vi.mock('./point.service', () => ({ PointService: vi.fn() }));

const { AdminUserService } = await import('./adminUser.service');

const ADMIN = 'admin1';

describe('AdminUserService', () => {
    let db: FakeFirestore;
    let accounts: Map<string, AuthAccount>;
    let emails: Map<string, string>;
    let auth: AuthDirectory;
    let deleteAccount: ReturnType<typeof vi.fn>;
    let getBalance: ReturnType<typeof vi.fn>;
    let service: InstanceType<typeof AdminUserService>;

    const seedUser = async (uid: string, createdAt: number, disabled = false) => {
        await db.doc(`users/${uid}`).set({
            email: `${uid}@example.com`, createdAt, mbti: 'INTJ', birthData: { secret: true },
        });
        accounts.set(uid, {
            uid, disabled, lastSignInAt: createdAt + 1,
        });
        emails.set(`${uid}@example.com`, uid);
    };

    beforeEach(async () => {
        db = new FakeFirestore();
        holder.db = db;
        accounts = new Map();
        emails = new Map();
        deleteAccount = vi.fn().mockResolvedValue({ deleted: ['ACCOUNT'] });
        getBalance = vi.fn().mockResolvedValue({
            availableBalance: 7, batches: [],
        });
        auth = {
            getAccounts: vi.fn((uids: string[]) => Promise.resolve(uids.flatMap((uid) => accounts.get(uid) ?? []))),
            getAccount: vi.fn((uid: string) => Promise.resolve(accounts.get(uid) ?? null)),
            findUidByEmail: vi.fn((email: string) => Promise.resolve(emails.get(email) ?? null)),
            setDisabled: vi.fn((uid: string, disabled: boolean) => {
                const account = accounts.get(uid);

                if (account) accounts.set(uid, {
                    ...account, disabled,
                });

                return Promise.resolve();
            }),
        };
        service = new AdminUserService({
            auth,
            points: { getBalance } as never,
            deletion: { deleteAccount } as never,
        });

        await seedUser('a', 10);
        await seedUser('b', 20);
        await seedUser('c', 20);
        await seedUser('d', 30, true);
    });

    describe('list', () => {
        it('returns the newest members first with their sign-in state', async () => {
            const page = await service.list({ limit: 10 });

            expect(page.items.map((item) => item.uid)).toEqual([
                'd',
                'c',
                'b',
                'a',
            ]);
            expect(page.items[0]).toEqual({
                uid: 'd', email: 'd@example.com', createdAt: 30, lastSignInAt: 31, disabled: true, pointBalance: 7, multiReportCount: 0,
            });
            expect(page.nextCursor).toBeNull();
        });

        it('pages without repeating or skipping members, even with equal createdAt', async () => {
            const first = await service.list({ limit: 2 });
            const second = await service.list({
                limit: 2, cursor: first.nextCursor ?? undefined,
            });

            expect(first.items.map((item) => item.uid)).toEqual(['d', 'c']);
            expect(first.nextCursor).not.toBeNull();
            expect(second.items.map((item) => item.uid)).toEqual(['b', 'a']);
            expect(second.nextCursor).toBeNull();
        });

        it('rejects a cursor that is not one of ours', async () => {
            await expect(service.list({
                limit: 2, cursor: 'not-a-cursor',
            })).rejects.toBeInstanceOf(ValidationError);
            await expect(service.list({
                limit: 2, cursor: Buffer.from(JSON.stringify({ createdAt: 'x' })).toString('base64url'),
            })).rejects.toBeInstanceOf(ValidationError);
        });

        it('finds one member by email, and nobody for an unknown one', async () => {
            const found = await service.list({
                limit: 20, email: 'b@example.com',
            });

            expect(found.items.map((item) => item.uid)).toEqual(['b']);
            expect(found.nextCursor).toBeNull();
            expect((await service.list({
                limit: 20, email: 'nobody@example.com',
            })).items).toEqual([]);
        });

        it('shows an account missing from Firebase Authentication as enabled and never signed in', async () => {
            accounts.delete('a');

            const page = await service.list({ limit: 10 });

            expect(page.items.find((item) => item.uid === 'a')).toMatchObject({
                disabled: false, lastSignInAt: null,
            });
        });
    });

    describe('what a row shows beyond the member document', () => {
        const aiReport = (uid: string, id: string, status: string) => db.doc(`users/${uid}/aiReports/${id}`).set({
            status, question: null, createdAt: 1,
        });

        it('counts only the member\'s own completed multi-dimension reports', async () => {
            await aiReport('b', 'r1', 'COMPLETED');
            await aiReport('b', 'r2', 'COMPLETED');
            await aiReport('b', 'r3', 'FAILED');
            await aiReport('b', 'r4', 'GENERATING');
            await aiReport('c', 'r5', 'COMPLETED');

            const page = await service.list({ limit: 10 });
            const count = (uid: string) => page.items.find((item) => item.uid === uid)?.multiReportCount;

            expect(count('b')).toBe(2);
            expect(count('c')).toBe(1);
            expect(count('a')).toBe(0);
        });

        it('gives each member their own point balance', async () => {
            getBalance.mockImplementation((uid: string) => Promise.resolve({
                availableBalance: uid === 'b' ? 12 : 0, batches: [],
            }));

            const page = await service.list({ limit: 10 });

            expect(page.items.find((item) => item.uid === 'b')?.pointBalance).toBe(12);
            expect(page.items.find((item) => item.uid === 'a')?.pointBalance).toBe(0);
        });

        it('still lists the member when the balance cannot be read', async () => {
            getBalance.mockRejectedValue(new Error('down'));

            const page = await service.list({ limit: 10 });

            expect(page.items).toHaveLength(4);
            expect(page.items.every((item) => item.pointBalance === null)).toBe(true);
        });

        it('carries the same figures for a member found by email, and nothing of their answers or profile', async () => {
            await aiReport('b', 'r1', 'COMPLETED');

            const found = await service.list({
                limit: 20, email: 'b@example.com',
            });

            expect(found.items[0]).toMatchObject({
                uid: 'b', pointBalance: 7, multiReportCount: 1,
            });
            expect(JSON.stringify(found)).not.toContain('secret');
        });
    });

    describe('setDisabled', () => {
        it('disables and enables a member', async () => {
            expect(await service.setDisabled(ADMIN, 'b', true)).toEqual({
                uid: 'b', disabled: true,
            });
            expect(accounts.get('b')?.disabled).toBe(true);

            await service.setDisabled(ADMIN, 'b', false);
            expect(accounts.get('b')?.disabled).toBe(false);
        });

        it('refuses to disable the administrator themselves', async () => {
            await seedUser(ADMIN, 5);

            await expect(service.setDisabled(ADMIN, ADMIN, true)).rejects.toMatchObject({ code: 'CANNOT_DISABLE_SELF' });
            expect(auth.setDisabled).not.toHaveBeenCalled();
        });

        it('answers 404 for an unknown member and changes nothing', async () => {
            await expect(service.setDisabled(ADMIN, 'nobody', true)).rejects.toBeInstanceOf(NotFoundError);
            expect(auth.setDisabled).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('deletes a disabled member with the account deletion flow', async () => {
            expect(await service.remove(ADMIN, 'd')).toEqual({
                uid: 'd', deleted: true,
            });
            expect(deleteAccount).toHaveBeenCalledWith('d');
        });

        it('refuses a member that is not disabled', async () => {
            await expect(service.remove(ADMIN, 'b')).rejects.toBeInstanceOf(BusinessLogicError);
            await expect(service.remove(ADMIN, 'b')).rejects.toMatchObject({ code: 'MEMBER_NOT_DISABLED' });
            expect(deleteAccount).not.toHaveBeenCalled();
        });

        it('refuses to delete the administrator themselves', async () => {
            await seedUser(ADMIN, 5, true);

            await expect(service.remove(ADMIN, ADMIN)).rejects.toMatchObject({ code: 'CANNOT_DELETE_SELF' });
            expect(deleteAccount).not.toHaveBeenCalled();
        });

        it('answers 404 for an unknown member', async () => {
            await expect(service.remove(ADMIN, 'nobody')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
