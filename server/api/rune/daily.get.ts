import {
    defineEventHandler, setResponseHeader,
} from 'h3';
import { dailyRuneResponseSchema } from '../../../shared/schemas/api/rune.schema';
import { RuneService } from '../../services/rune.service';
import { requireViewer } from '../../utils/viewer';
import { toH3Error } from '../../utils/errorHandler';

export default defineEventHandler(async (event) => {
    try {
        // Identity comes from the token or the guest session and the date from the server clock; nothing else in the request is used.
        const viewer = await requireViewer(event);

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        const service = new RuneService();

        return dailyRuneResponseSchema.parse(viewer.kind === 'member' ? await service.getToday(viewer.uid) : service.getTodayForGuest());
    } catch (error) {
        throw toH3Error(error);
    }
});
