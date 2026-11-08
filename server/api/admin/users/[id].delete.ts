import {
    defineEventHandler, getRouterParam,
} from 'h3';
import {
    adminUserDeleteResultSchema, adminUserIdSchema,
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

        return adminUserDeleteResultSchema.parse(await new AdminUserService().remove(admin.uid, id.data));
    } catch (error) {
        throw toH3Error(error);
    }
});
