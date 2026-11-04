import {
    defineEventHandler, getQuery, setResponseHeader,
} from 'h3';
import {
    homePreviewQuerySchema, homePreviewResponseSchema,
} from '../../../shared/schemas/api/home.schema';
import { HomeService } from '../../services/home.service';
import { RateLimitService } from '../../services/rateLimit.service';
import { requireServerSecret } from '../../../config/config';
import { getClientIp } from '../../utils/clientIp';
import { toH3Error } from '../../utils/errorHandler';
import { keyedHash } from '../../utils/hmac';
import { ValidationError } from '../../../shared/types/errors';

/** Only what has to be read from the store is counted (see HomeService.preview), so this is generous for real use. */
const READS_PER_IP_PER_MINUTE = 60;
const ONE_MINUTE_MS = 60 * 1000;

/** The same answer for everyone: the edge may keep it for an hour. */
const SHARED_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400';

/**
 * The home page's preview: the title and summary of a sign's and a life path number's content, in one request.
 * Public, writes nothing, and never receives a birth date.
 */
export default defineEventHandler(async (event) => {
    // An error must never be kept by a shared cache; only the answer below is
    setResponseHeader(event, 'Cache-Control', 'no-store');

    try {
        const query = homePreviewQuerySchema.safeParse(getQuery(event));

        if (!query.success) {
            throw new ValidationError('A sign and/or a life path number is required', { issues: query.error.issues });
        }

        const response = await new HomeService().preview(query.data, async () => {
            const ipHash = keyedHash(`ip:${getClientIp(event)}`, requireServerSecret('welcomeGrantHmacKey'));

            await new RateLimitService().consume(`homePreview_${ipHash}`, READS_PER_IP_PER_MINUTE, ONE_MINUTE_MS);
        });
        const body = homePreviewResponseSchema.parse(response);

        setResponseHeader(event, 'Cache-Control', SHARED_CACHE);

        return body;
    } catch (error) {
        throw toH3Error(error);
    }
});
