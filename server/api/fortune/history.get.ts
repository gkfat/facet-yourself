import {
    defineEventHandler, getQuery, setResponseHeader,
} from 'h3';
import {
    fortuneHistoryQuerySchema, fortuneHistoryResponseSchema,
} from '../../../shared/schemas/api/fortuneHistory.schema';
import { FortuneHistoryService } from '../../services/fortuneHistory.service';
import { requireAuth } from '../../utils/auth';
import { toH3Error } from '../../utils/errorHandler';
import { ValidationError } from '../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        // Members only: a visitor keeps no draws. Whose history it is comes from the token, never from the request.
        const { uid } = await requireAuth(event);
        const query = fortuneHistoryQuerySchema.safeParse(getQuery(event));

        if (!query.success) {
            throw new ValidationError('Invalid query', { issues: query.error.issues });
        }

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        return fortuneHistoryResponseSchema.parse(await new FortuneHistoryService().list(uid, query.data));
    } catch (error) {
        throw toH3Error(error);
    }
});
