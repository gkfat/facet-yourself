import {
    defineEventHandler, getQuery,
} from 'h3';
import {
    adminDailyAiCostSchema, adminDashboardRangeQuerySchema,
} from '../../../../shared/schemas/api/adminDashboard.schema';
import { AdminDashboardService } from '../../../services/adminDashboard.service';
import { requireAdmin } from '../../../utils/admin';
import { toH3Error } from '../../../utils/errorHandler';
import { ValidationError } from '../../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        await requireAdmin(event);

        const query = adminDashboardRangeQuerySchema.safeParse(getQuery(event));

        if (!query.success) {
            throw new ValidationError('Invalid query', { issues: query.error.issues });
        }

        return adminDailyAiCostSchema.parse(await new AdminDashboardService().dailyAiCost(query.data.days));
    } catch (error) {
        throw toH3Error(error);
    }
});
