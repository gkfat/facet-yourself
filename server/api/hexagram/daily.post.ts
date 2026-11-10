import {
    defineEventHandler, readBody, setResponseHeader,
} from 'h3';
import {
    hexagramCastRequestSchema, hexagramCastResponseSchema,
} from '../../../shared/schemas/api/hexagram.schema';
import { HexagramService } from '../../services/hexagram.service';
import { requireViewer } from '../../utils/viewer';
import { toH3Error } from '../../utils/errorHandler';
import { ValidationError } from '../../../shared/types/errors';

export default defineEventHandler(async (event) => {
    try {
        // Who is asking is settled before the body is read
        const viewer = await requireViewer(event);

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        // The only things a request may carry are an idempotency key and the confirmation of the price: no date, no
        // identity, no lines, no number of the cast and no free text.
        const body = hexagramCastRequestSchema.safeParse((await readBody(event)) ?? {});

        if (!body.success) throw new ValidationError('Invalid cast request', { issues: body.error.issues });

        const service = new HexagramService();

        return hexagramCastResponseSchema.parse(viewer.kind === 'member'
            ? await service.draw(viewer.uid, body.data)
            : await service.drawForGuest(viewer.sessionId, body.data));
    } catch (error) {
        throw toH3Error(error);
    }
});
