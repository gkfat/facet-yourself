import {
    defineEventHandler, getHeader, readBody, setResponseHeader, setResponseStatus,
} from 'h3';
import {
    aiReportAcceptedSchema, aiReportRequestSchema,
} from '../../../shared/schemas/api/aiReport.schema';
import { idempotencyKeySchema } from '../../../shared/schemas/api/idempotency.schema';
import { AiReportService } from '../../services/aiReport.service';
import { requireAuth } from '../../utils/auth';
import { toH3Error } from '../../utils/errorHandler';
import { ValidationError } from '../../../shared/types/errors';

/**
 * An AI report of one or more of the member's lasting systems, with an optional question: paid in points, made after the
 * response. The Idempotency-Key header is the report's id; it is read and polled through `GET /api/ai-reports`.
 */
export default defineEventHandler(async (event) => {
    try {
        const { uid } = await requireAuth(event);
        const key = idempotencyKeySchema.safeParse(getHeader(event, 'idempotency-key'));

        if (!key.success) {
            throw new ValidationError('Idempotency-Key header is required (8-64 letters, digits, - or _)');
        }

        const body = aiReportRequestSchema.safeParse(await readBody(event));

        if (!body.success) {
            throw new ValidationError('At least one different system is required, and the question is at most 100 characters', { issues: body.error.issues });
        }

        setResponseHeader(event, 'Cache-Control', 'private, no-store');
        setResponseStatus(event, 202);

        return aiReportAcceptedSchema.parse(await new AiReportService().create(uid, body.data.systems, key.data, body.data.question));
    } catch (error) {
        throw toH3Error(error);
    }
});
