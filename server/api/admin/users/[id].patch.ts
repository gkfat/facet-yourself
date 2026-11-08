import {
    defineEventHandler, getRouterParam, readBody,
} from 'h3';
import {
    adminUserIdSchema, adminUserPatchResultSchema, adminUserPatchSchema,
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

        const body = adminUserPatchSchema.safeParse(await readBody(event));

        if (!body.success) {
            throw new ValidationError('Invalid body', { issues: body.error.issues });
        }

        const result = await new AdminUserService().setDisabled(admin.uid, id.data, body.data.disabled);

        return adminUserPatchResultSchema.parse(result);
    } catch (error) {
        throw toH3Error(error);
    }
});
