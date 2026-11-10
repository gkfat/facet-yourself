import { AggregateField } from 'firebase-admin/firestore';
import type { Query } from 'firebase-admin/firestore';
import { BaseRepository } from './base.repository';
import type { UserDoc } from '../../shared/schemas/firestore/user.schema';
import type { MappingSystem } from '../../shared/ontology/schema';
import type { PointTransactionDoc } from '../../shared/schemas/firestore/points.schema';
import {
    aiReportDocSchema, type AiReportDoc,
} from '../../shared/schemas/firestore/aiReport.schema';
import { DatabaseError } from '../../shared/types/errors';

export type TimeRange = {
    /** Inclusive */
    from: number;
    /** Exclusive */
    to: number;
};

export type AiUsageTotals = {
    cost: number;
    inputTokens: number;
    outputTokens: number;
};

/** The part of an AI report the dashboard reads. */
export type AiReportRow = Pick<AiReportDoc, 'status' | 'question' | 'createdAt'> & {
    systems: string[];
};

const aiReportRowSchema = aiReportDocSchema.pick({
    status: true, question: true, createdAt: true, sources: true,
});

export type DrawGroup = 'tarotDraws' | 'runeDraws' | 'hexagramDraws';

/**
 * Aggregations for the back-office dashboard. Every number is a Firestore count or sum, so no document is
 * downloaded however many there are.
 */
export class AdminStatsRepository extends BaseRepository<UserDoc> {
    protected collectionName = 'users';

    async countUsers(range?: TimeRange): Promise<number> {
        const query = range
            ? this.collection.where('createdAt', '>=', range.from).where('createdAt', '<', range.to)
            : this.collection;

        return this.count(query);
    }

    /** Draws made in the range, by the members' collection group (`tarotDraws`, `runeDraws` or `hexagramDraws`). */
    async countDraws(group: DrawGroup, range: TimeRange): Promise<number> {
        return this.count(this.db.collectionGroup(group).where('drawnAt', '>=', range.from).where('drawnAt', '<', range.to));
    }

    /** When the oldest kept draw of this group was made, or null when there is none. */
    async earliestDrawAt(group: DrawGroup): Promise<number | null> {
        const snapshot = await this.db.collectionGroup(group).orderBy('drawnAt', 'asc').limit(1).get();
        const value = snapshot.docs[0]?.data().drawnAt;

        return typeof value === 'number' ? value : null;
    }

    /** Sum of the amounts of the point transactions of one type made in the range, optionally of one reason. */
    async sumPoints(type: PointTransactionDoc['type'], range: TimeRange, reason?: PointTransactionDoc['reason']): Promise<number> {
        const typed = this.db.collectionGroup('pointTransactions').where('type', '==', type);
        const scoped = reason ? typed.where('reason', '==', reason) : typed;
        const query = scoped.where('createdAt', '>=', range.from).where('createdAt', '<', range.to);
        const snapshot = await query.aggregate({ total: AggregateField.sum('amount') }).get();

        return snapshot.data().total ?? 0;
    }

    async sumAiUsage(range: TimeRange): Promise<AiUsageTotals> {
        const query = this.db.collection('aiUsageRecords').where('createdAt', '>=', range.from).where('createdAt', '<', range.to);
        const snapshot = await query.aggregate({
            cost: AggregateField.sum('estimatedCost'),
            inputTokens: AggregateField.sum('inputTokens'),
            outputTokens: AggregateField.sum('outputTokens'),
        }).get();
        const data = snapshot.data();

        return {
            cost: data.cost ?? 0,
            inputTokens: data.inputTokens ?? 0,
            outputTokens: data.outputTokens ?? 0,
        };
    }

    /** The newest AI reports made since `since`, at most `limit`; only the fields the dashboard reads are fetched. */
    async listAiReports(since: number, limit: number): Promise<AiReportRow[]> {
        const snapshot = await this.db.collectionGroup('aiReports')
            .where('createdAt', '>=', since)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .select('status', 'question', 'createdAt', 'sources')
            .get();

        return snapshot.docs.map((doc) => {
            const parsed = aiReportRowSchema.safeParse(doc.data());

            if (!parsed.success) throw new DatabaseError(`AI report ${doc.id} is malformed`);

            return {
                status: parsed.data.status,
                question: parsed.data.question,
                createdAt: parsed.data.createdAt,
                systems: [...new Set(parsed.data.sources.map((source) => source.system))],
            };
        });
    }

    /** Kept snapshots of single-dimension analyses of one system. */
    async countSingleSnapshots(system: MappingSystem): Promise<number> {
        return this.count(this.db.collectionGroup('reportSnapshots')
            .where('kind', '==', 'SINGLE')
            .where('systems', 'array-contains', system));
    }

    private async count(query: Query): Promise<number> {
        const snapshot = await query.count().get();

        return snapshot.data().count;
    }
}
