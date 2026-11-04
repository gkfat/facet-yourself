import {
    defineEventHandler, setResponseHeader,
} from 'h3';
import { dailyHoroscopeResponseSchema } from '../../../shared/schemas/api/horoscope.schema';
import { HoroscopeService } from '../../services/horoscope.service';
import { requireViewer } from '../../utils/viewer';
import { toH3Error } from '../../utils/errorHandler';

export default defineEventHandler(async (event) => {
    try {
        // The sign comes from the saved profile or the guest session and the date from the server clock; nothing else in the request is used.
        const viewer = await requireViewer(event);

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        const service = new HoroscopeService();

        return dailyHoroscopeResponseSchema.parse(
            viewer.kind === 'member' ? await service.getToday(viewer.uid) : await service.getTodayForGuest(viewer.sessionId),
        );
    } catch (error) {
        throw toH3Error(error);
    }
});
