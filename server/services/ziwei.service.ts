import { BaseService } from './base.service';
import { buildBirthMoment } from '../bazi/birthMoment';
import { DEFAULT_BAZI_TIME_ZONE } from '../../shared/constants/bazi';
import { findCity } from '../../shared/constants/cities';
import type {
    ZiweiRequest, ZiweiResponse,
} from '../../shared/schemas/api/ziwei.schema';
import {
    AppError, ValidationError,
} from '../../shared/types/errors';
import {
    ZiweiMissingBirthTimeError,
    calculateChart,
} from '../../shared/utils/ziwei/chart';
import { ZiweiDateError } from '../../shared/utils/ziwei/lunar';
import { UnverifiedRulesError } from '../../shared/utils/ziwei/rules';
import { ZiweiTimeError } from '../../shared/utils/ziwei/hour';

/** Zi Wei needs every rule table confirmed; until then the chart is refused with this code rather than computed. */
export const ZIWEI_RULES_UNVERIFIED_CODE = 'ZIWEI_RULES_UNVERIFIED';

/**
 * The Zi Wei chart for a birth moment. A fixed calculation: nothing is stored and no AI is involved.
 * The birth time is required, and the chart is only produced while every rule table is verified.
 */
export class ZiweiService extends BaseService {
    protected serviceName = 'ziwei';

    calculate(request: ZiweiRequest): ZiweiResponse {
        const city = request.birthPlace ? findCity(request.birthPlace) : undefined;

        if (request.birthPlace && !city) {
            throw new ValidationError('birthPlace is not in the preset city list');
        }

        const timeZone = city?.timeZone ?? DEFAULT_BAZI_TIME_ZONE;
        const moment = buildBirthMoment({
            birthDate: request.birthDate,
            birthTime: request.birthTime,
            timeZone,
        });

        try {
            const chart = calculateChart(moment);

            return {
                timeZone,
                timeZoneAssumed: city === undefined,
                algorithmVersion: chart.algorithmVersion,
                meta: chart.meta,
                bureau: chart.bureau,
                lifeMaster: chart.lifeMaster,
                bodyMaster: chart.bodyMaster,
                ziweiBranch: chart.ziweiBranch,
                palaces: chart.palaces,
                bodyPalace: chart.bodyPalace,
                birthYearTransformations: chart.birthYearTransformations,
                hourNotes: chart.hourNotes,
            };
        } catch (error) {
            throw this.toAppError(error);
        }
    }

    private toAppError(error: unknown): unknown {
        if (error instanceof UnverifiedRulesError) {
            this.logError('Zi Wei chart refused: rule tables are not verified', {
                action: 'calculate',
                error,
                data: { rules: error.rules },
            });

            return new AppError('Zi Wei is not available yet', 503, ZIWEI_RULES_UNVERIFIED_CODE, { rules: error.rules });
        }

        if (error instanceof ZiweiMissingBirthTimeError) {
            return new ValidationError('A birth time is required for a Zi Wei chart');
        }

        if (error instanceof ZiweiDateError || error instanceof ZiweiTimeError) {
            return new ValidationError(error.message);
        }

        return error;
    }
}
