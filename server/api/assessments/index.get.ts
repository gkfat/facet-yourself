import { defineEventHandler } from 'h3';
import { z } from 'zod';
import { assessmentSummarySchema } from '../../../shared/schemas/api/assessment.schema';
import { AssessmentService } from '../../services/assessment.service';
import { toH3Error } from '../../utils/errorHandler';

export default defineEventHandler(async (event) => {
    try {
        // The middleware already authenticated the token if one was sent.
        const uid: string | null = event.context.auth?.uid ?? null;

        return z.array(assessmentSummarySchema).parse(await new AssessmentService().list(uid));
    } catch (error) {
        throw toH3Error(error);
    }
});
