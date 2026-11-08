import {
    defineEventHandler, getQuery,
} from 'h3';
import {
    adminUserListQuerySchema, adminUserListSchema,
} from '../../../../shared/schemas/api/adminUsers.schema';
import { AdminUserService } from '../../../services/adminUser.service';
import { requireAdmin } from '../../../utils/admin';
import { toH3Error } from '../../../utils/errorHandler';
import { ValidationError } from '../../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        await requireAdmin(event);

        const query = adminUserListQuerySchema.safeParse(getQuery(event));

        if (!query.success) {
            throw new ValidationError('Invalid query', { issues: query.error.issues });
        }

        return adminUserListSchema.parse(await new AdminUserService().list(query.data));
    } catch (error) {
        throw toH3Error(error);
    }
});
