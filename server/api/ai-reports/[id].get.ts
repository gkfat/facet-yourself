import {
    defineEventHandler, getRouterParam, setResponseHeader,
} from 'h3';
import { aiReportItemSchema } from '../../../shared/schemas/api/aiReport.schema';
import { AiReportService } from '../../services/aiReport.service';
import { requireAuth } from '../../utils/auth';
import { toH3Error } from '../../utils/errorHandler';
import { NotFoundError } from '../../../shared/types/errors';

/** One of the member's AI reports in full. Reports live under the caller's own user document, so another member's id is simply "not found". */
export default defineEventHandler(async (event) => {
    try {
        const { uid } = await requireAuth(event);
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw new NotFoundError('AI report');
        }

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        return aiReportItemSchema.parse(await new AiReportService().get(uid, id));
    } catch (error) {
        throw toH3Error(error);
    }
});
