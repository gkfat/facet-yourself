import {
    defineEventHandler, setResponseHeader,
} from 'h3';
import { kinTodayResponseSchema } from '../../../shared/schemas/api/mayaKin.schema';
import { KinUnlockService } from '../../services/kinUnlock.service';
import { requireViewer } from '../../utils/viewer';
import { toH3Error } from '../../utils/errorHandler';

export default defineEventHandler(async (event) => {
    try {
        // Identity comes from the token or the guest session and the date from the server clock; nothing else in the request is used.
        const viewer = await requireViewer(event);

        setResponseHeader(event, 'Cache-Control', 'private, no-store');

        const service = new KinUnlockService();

        return kinTodayResponseSchema.parse(viewer.kind === 'member' ? await service.getToday(viewer.uid) : service.getTodayForGuest());
    } catch (error) {
        throw toH3Error(error);
    }
});
