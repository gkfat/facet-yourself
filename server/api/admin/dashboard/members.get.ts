import { defineEventHandler } from 'h3';
import { adminMembersSummarySchema } from '../../../../shared/schemas/api/adminDashboard.schema';
import { AdminDashboardService } from '../../../services/adminDashboard.service';
import { requireAdmin } from '../../../utils/admin';
import { toH3Error } from '../../../utils/errorHandler';

export default defineEventHandler(async (event) => {
    try {
        await requireAdmin(event);

        return adminMembersSummarySchema.parse(await new AdminDashboardService().members());
    } catch (error) {
        throw toH3Error(error);
    }
});
