import {
    defineEventHandler, getRouterParam, setResponseHeader,
} from 'h3';
import {
    adminUserDetailSchema, adminUserIdSchema,
} from '../../../../shared/schemas/api/adminUsers.schema';
import { AdminUserService } from '../../../services/adminUser.service';
import { requireAdmin } from '../../../utils/admin';
import { toH3Error } from '../../../utils/errorHandler';
import { ValidationError } from '../../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        const admin = await requireAdmin(event);

        const id = adminUserIdSchema.safeParse(getRouterParam(event, 'id'));

        if (!id.success) {
            throw new ValidationError('Invalid user id', { issues: id.error.issues });
        }

        // Personal data: never kept in a shared cache
        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        return adminUserDetailSchema.parse(await new AdminUserService().getDetail(admin.uid, id.data));
    } catch (error) {
        throw toH3Error(error);
    }
});
