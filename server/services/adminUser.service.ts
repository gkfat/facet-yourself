import { z } from 'zod';
import { BaseService } from './base.service';
import { DeletionService } from './deletion.service';
import { PointService } from './point.service';
import {
    AdminUserRepository, type AdminUserCursor, type AdminUserRow,
} from '../repositories/adminUser.repository';
import {
    createFirebaseAuthDirectory, type AuthAccount, type AuthDirectory,
} from '../utils/firebaseAuthDirectory';
import type {
    AdminUserList, AdminUserListItem, AdminUserListQuery,
} from '../../shared/schemas/api/adminUsers.schema';
import { mapLimit } from '../utils/mapLimit';
import { epochMsSchema } from '../../shared/schemas/common';
import {
    BusinessLogicError, NotFoundError, ValidationError, errorMessage,
} from '../../shared/types/errors';

type AdminUserServiceOptions = {
    repository?: AdminUserRepository;
    auth?: AuthDirectory;
    points?: Pick<PointService, 'getBalance'>;
    deletion?: Pick<DeletionService, 'deleteAccount'>;
};

/** Reads for the rows of one page run this many at a time. */
const ROW_READ_CONCURRENCY = 6;

const cursorSchema = z.object({
    createdAt: epochMsSchema,
    uid: z.string().min(1).max(128),
});

export function encodeUserCursor(cursor: AdminUserCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

/** The cursor comes from the client, so it is checked like any other input. */
export function decodeUserCursor(raw: string): AdminUserCursor {
    try {
        return cursorSchema.parse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
    } catch (error) {
        throw new ValidationError('Invalid cursor', { reason: errorMessage(error) });
    }
}

export class AdminUserService extends BaseService {
    protected serviceName = 'admin-users';

    private readonly repository: AdminUserRepository;
    private readonly auth: AuthDirectory;
    private readonly points: Pick<PointService, 'getBalance'>;
    private readonly deletion: Pick<DeletionService, 'deleteAccount'>;

    constructor(options: AdminUserServiceOptions = {}) {
        super();
        this.repository = options.repository ?? new AdminUserRepository();
        this.auth = options.auth ?? createFirebaseAuthDirectory();
        this.points = options.points ?? new PointService();
        this.deletion = options.deletion ?? new DeletionService();
    }

    /** One page of members, newest first, or the single member with this email. */
    async list(query: AdminUserListQuery): Promise<AdminUserList> {
        if (query.email) return this.findByEmail(query.email);

        const after = query.cursor ? decodeUserCursor(query.cursor) : null;
        // One more than asked tells whether another page exists
        const rows = await this.repository.listPage(query.limit + 1, after);
        const page = rows.slice(0, query.limit);
        const last = page[page.length - 1];

        return {
            items: await this.withAccounts(page),
            nextCursor: rows.length > query.limit && last
                ? encodeUserCursor({
                    createdAt: last.createdAt, uid: last.uid,
                })
                : null,
        };
    }

    /** Disable or enable a member's sign-in. An administrator cannot lock themselves out. */
    async setDisabled(actorUid: string, uid: string, disabled: boolean): Promise<{ uid: string; disabled: boolean }> {
        if (uid === actorUid) {
            throw new BusinessLogicError('An administrator cannot disable themselves', 'CANNOT_DISABLE_SELF');
        }

        await this.requireMember(uid);
        await this.auth.setDisabled(uid, disabled);

        this.logInfo(disabled ? 'member disabled' : 'member enabled', {
            action: 'setDisabled',
            userId: actorUid,
            data: { targetUid: uid },
        });

        return {
            uid, disabled,
        };
    }

    /** Delete a disabled member with the same flow as their own account deletion. */
    async remove(actorUid: string, uid: string): Promise<{ uid: string; deleted: true }> {
        if (uid === actorUid) {
            throw new BusinessLogicError('An administrator cannot delete themselves', 'CANNOT_DELETE_SELF');
        }

        await this.requireMember(uid);

        const account = await this.auth.getAccount(uid);

        if (account && !account.disabled) {
            throw new BusinessLogicError('Disable the member before deleting', 'MEMBER_NOT_DISABLED');
        }

        await this.deletion.deleteAccount(uid);

        this.logInfo('member deleted', {
            action: 'remove',
            userId: actorUid,
            data: { targetUid: uid },
        });

        return {
            uid, deleted: true,
        };
    }

    private async findByEmail(email: string): Promise<AdminUserList> {
        const uid = await this.auth.findUidByEmail(email);
        const row = uid ? await this.repository.findRow(uid) : null;

        return {
            items: row ? await this.withAccounts([row]) : [],
            nextCursor: null,
        };
    }

    private async requireMember(uid: string): Promise<AdminUserRow> {
        const row = await this.repository.findRow(uid);

        if (!row) throw new NotFoundError('User');

        return row;
    }

    /**
     * Add what the list shows beyond the member document: the sign-in state kept in Firebase Authentication (an account
     * missing there reads as enabled and never signed in), the point balance and the completed multi-dimension reports.
     */
    private async withAccounts(rows: AdminUserRow[]): Promise<AdminUserListItem[]> {
        const accounts = new Map<string, AuthAccount>(
            (await this.auth.getAccounts(rows.map((row) => row.uid))).map((account) => [account.uid, account]),
        );

        return mapLimit(rows, ROW_READ_CONCURRENCY, async (row) => ({
            uid: row.uid,
            email: row.email,
            createdAt: row.createdAt,
            lastSignInAt: accounts.get(row.uid)?.lastSignInAt ?? null,
            disabled: accounts.get(row.uid)?.disabled ?? false,
            pointBalance: await this.readBalance(row.uid),
            multiReportCount: await this.readMultiReportCount(row.uid),
        }));
    }

    private async readBalance(uid: string): Promise<number | null> {
        try {
            return (await this.points.getBalance(uid)).availableBalance;
        } catch (error) {
            this.logError('could not read the point balance', {
                action: 'list',
                data: { targetUid: uid },
                error,
            });

            return null;
        }
    }

    private async readMultiReportCount(uid: string): Promise<number | null> {
        try {
            return await this.repository.countCompletedAiReports(uid);
        } catch (error) {
            this.logError('could not count the multi-dimension reports', {
                action: 'list',
                data: { targetUid: uid },
                error,
            });

            return null;
        }
    }
}
