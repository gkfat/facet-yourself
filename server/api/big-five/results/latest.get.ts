import { defineEventHandler } from 'h3';
import { bigFiveResultSchema } from '../../../../shared/schemas/api/bigFive.schema';
import { BigFiveService } from '../../../services/bigFive.service';
import { requireAuth } from '../../../utils/auth';
import { toH3Error } from '../../../utils/errorHandler';

export default defineEventHandler(async (event) => {
    try {
        const { uid } = await requireAuth(event);

        return bigFiveResultSchema.parse(await new BigFiveService().latest(uid));
    } catch (error) {
        throw toH3Error(error);
    }
});
