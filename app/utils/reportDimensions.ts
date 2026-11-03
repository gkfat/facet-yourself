import {
    ASSESSMENT_SYSTEM_BY_ID, type AssessmentId,
} from '../../shared/assessments/ids';
import type { MultiReportSystem } from '../../shared/report/systems';
import { assessmentCards } from './assessmentCards';

export type DimensionMeta = {
    value: MultiReportSystem;
    label: string;
    icon: string;
    tone: string;
    /** What the system needs from the member before it can be part of a report */
    need: string;
    /** Set for a self-analysis: whether it is ready is whether the member has a result of it that has not expired */
    assessmentId?: AssessmentId;
};

/** The same icon and color each system has on the self-reports screen, in the order they are listed. */
export const DIMENSION_META: readonly DimensionMeta[] = [
    {
        value: 'ZODIAC', label: '星座', icon: 'mdi-star-four-points-outline', tone: '#b7791f', need: '出生日期',
    },
    {
        value: 'BLOOD', label: '血型', icon: 'mdi-water-outline', tone: '#c94f4f', need: '血型',
    },
    {
        value: 'MBTI', label: 'MBTI', icon: 'mdi-head-cog-outline', tone: '#2f5d8a', need: '16 型人格測驗',
    },
    {
        value: 'HUMAN_DESIGN', label: '人類圖', icon: 'mdi-vector-triangle', tone: '#2e7d5b', need: '出生日期、時間與城市',
    },
    {
        value: 'NUMEROLOGY', label: '生命靈數', icon: 'mdi-numeric', tone: '#7a5aa6', need: '出生日期',
    },
    {
        value: 'BAZI', label: '八字', icon: 'mdi-yin-yang', tone: '#8c5e34', need: '出生日期與時間',
    },
    {
        value: 'MAYA_KIN', label: '瑪雅 Kin', icon: 'mdi-calendar-star', tone: '#c94f4f', need: '出生日期',
    },
];

/** The self-analyses that are open, each one a system a report can combine once the member has a result of it */
export function assessmentDimensions(): DimensionMeta[] {
    return assessmentCards().map((card) => ({
        value: ASSESSMENT_SYSTEM_BY_ID[card.id],
        label: card.title,
        icon: card.icon,
        tone: card.tone,
        need: `完成${card.title}測驗`,
        assessmentId: card.id,
    }));
}
