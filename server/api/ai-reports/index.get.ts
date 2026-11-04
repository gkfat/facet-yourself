import {
    defineEventHandler, setResponseHeader,
} from 'h3';
import { z } from 'zod';
import { aiReportSummarySchema } from '../../../shared/schemas/api/aiReport.schema';
import { AiReportService } from '../../services/aiReport.service';
import { requireAuth } from '../../utils/auth';
import { toH3Error } from '../../utils/errorHandler';

/** The member's AI reports (running, done or failed and refunded), newest first. */
export default defineEventHandler(async (event) => {
    try {
        const { uid } = await requireAuth(event);

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        return z.array(aiReportSummarySchema).parse(await new AiReportService().list(uid));
    } catch (error) {
        throw toH3Error(error);
    }
});
