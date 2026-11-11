import {
    defineEventHandler, readBody,
} from 'h3';
import {
    ziweiRequestSchema, ziweiResponseSchema,
} from '../../../shared/schemas/api/ziwei.schema';
import { ZiweiService } from '../../services/ziwei.service';
import { toH3Error } from '../../utils/errorHandler';
import { ValidationError } from '../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        const body = ziweiRequestSchema.safeParse(await readBody(event));

        if (!body.success) {
            throw new ValidationError('Invalid birth data', { issues: body.error.issues });
        }

        return ziweiResponseSchema.parse(new ZiweiService().calculate(body.data));
    } catch (error) {
        throw toH3Error(error);
    }
});
