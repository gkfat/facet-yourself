import {
    defineEventHandler, getRouterParam,
} from 'h3';
import { assessmentResultSchema } from '../../../../../shared/schemas/api/assessment.schema';
import { AssessmentService } from '../../../../services/assessment.service';
import { requireAuth } from '../../../../utils/auth';
import { toH3Error } from '../../../../utils/errorHandler';
import { NotFoundError } from '../../../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        if (!id) {
            throw new NotFoundError('Assessment');
        }

        const { uid } = await requireAuth(event);

        return assessmentResultSchema.parse(await new AssessmentService().latest(id, uid));
    } catch (error) {
        throw toH3Error(error);
    }
});
