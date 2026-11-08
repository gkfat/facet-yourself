import {
    defineEventHandler, getRouterParam, setResponseHeader,
} from 'h3';
import { AiReportService } from '../../services/aiReport.service';
import { requireAuth } from '../../utils/auth';
import { toH3Error } from '../../utils/errorHandler';
import { NotFoundError } from '../../../shared/types/errors';

/** The member deletes one of their own AI reports (under their own user document, so another member's id is "not found"). One still being made is refused with 409. */
export default defineEventHandler(async (event) => {
    try {
        const { uid } = await requireAuth(event);
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw new NotFoundError('AI report');
        }

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        await new AiReportService().delete(uid, id);

        return { id };
    } catch (error) {
        throw toH3Error(error);
    }
});
