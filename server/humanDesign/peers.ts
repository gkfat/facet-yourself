import { calculateHumanDesign } from './calculate';
import { HUMAN_DESIGN_TYPE_LABELS } from '../../shared/constants/humanDesignLabels';
import {
    HUMAN_DESIGN_FIGURES, type HumanDesignFigure,
} from '../../shared/constants/peerFigures/humanDesignFigures';
import type {
    PeerFigure, Peers,
} from '../../shared/report/types';
import type { HumanDesignResult } from '../../shared/schemas/firestore/humanDesign.schema';

type Charted = {
    figure: HumanDesignFigure;
    type: HumanDesignResult['type'];
    profile: string;
};

let charted: readonly Charted[] | null = null;

/** The chart of each listed person, worked out once: it never changes */
function chartedFigures(): readonly Charted[] {
    charted ??= HUMAN_DESIGN_FIGURES.map((figure) => {
        const chart = calculateHumanDesign(figure.birthDate, figure.birthTime, figure.timeZone);

        return {
            figure, type: chart.type, profile: chart.profile,
        };
    });

    return charted;
}

const peerOf = ({
    figure, type, profile, 
}: Charted): PeerFigure => {
    const [
        year,
        month,
        day,
    ] = figure.birthDate.split('-').map(Number);

    return {
        name: figure.name,
        nameEn: figure.nameEn,
        detail: `${year} 年 ${month} 月 ${day} 日 ${figure.birthTime} 生於${figure.place}・${HUMAN_DESIGN_TYPE_LABELS[type]} ${profile}・${figure.role}`,
    };
};

/**
 * The well-known people with the same type and profile; when none has both, those with the same type. Null when there is no one.
 */
export function humanDesignPeers(chart: Pick<HumanDesignResult, 'type' | 'profile'>): Peers | null {
    const sameType = chartedFigures().filter((entry) => entry.type === chart.type);
    const exact = sameType.filter((entry) => entry.profile === chart.profile);
    const note = '出生時間取自出生證明等紀錄（Astro-Databank AA 級），僅供參考；只是同一類型，與你的特質沒有因果關係。';

    if (exact.length > 0) {
        return {
            title: '相同人類圖類型與人生角色的偉人', figures: exact.map(peerOf), note,
        };
    }

    if (sameType.length === 0) return null;

    return {
        title: '相同人類圖類型的偉人', figures: sameType.map(peerOf), note,
    };
}
