import {
    defineEventHandler, getRouterParam, readBody,
} from 'h3';
import {
    assessmentResultSchema, assessmentSubmissionRequestSchema,
} from '../../../../shared/schemas/api/assessment.schema';
import { AssessmentService } from '../../../services/assessment.service';
import { toH3Error } from '../../../utils/errorHandler';
import {
    NotFoundError, ValidationError,
} from '../../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw new NotFoundError('Assessment');
        }

        const body = assessmentSubmissionRequestSchema.safeParse(await readBody(event));

        if (!body.success) {
            throw new ValidationError('Invalid submission', { issues: body.error.issues });
        }

        // The middleware already authenticated the token if one was sent. A guest is not kept: the result only shows.
        const uid: string | null = event.context.auth?.uid ?? null;

        return assessmentResultSchema.parse(await new AssessmentService().submit(id, body.data, { uid }));
    } catch (error) {
        throw toH3Error(error);
    }
});
