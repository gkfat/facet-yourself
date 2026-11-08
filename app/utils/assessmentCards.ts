import {
    ASSESSMENTS, type AssessmentDefinition, type AssessmentId,
} from '../../shared/assessments';
import { ASSESSMENT_ENTRY_ENABLED } from '../../shared/assessments/entry';
import type { SystemKey } from './homeAnalyses';
import { TONES } from '../../shared/constants/palette';

type AssessmentCardInfo = {
    /** Which kind of analysis the card is listed under */
    system: SystemKey;
    icon: string;
    tone: string;
    description: string;
};

/** What the home page and the page of the reports say about each self-analysis; every id has one, so a new id cannot be left without */
const CARD_INFO: Readonly<Record<AssessmentId, AssessmentCardInfo>> = {
    'enneagram': {
        system: 'personality', icon: 'mdi-star-four-points-outline', tone: TONES.olive, description: '看你最在意什麼、壓力下怎麼反應，以及可以往哪個方向成長。',
    },
    'hexaco': {
        system: 'personality', icon: 'mdi-chart-bar', tone: TONES.green, description: '從六個面向看你的人格傾向，包含誠實與謙遜。',
    },
    'via-strengths': {
        system: 'practical', icon: 'mdi-arm-flex-outline', tone: TONES.copper, description: '找出你最常用、也最有精神的品格優勢。',
    },
    'riasec': {
        system: 'practical', icon: 'mdi-briefcase-search-outline', tone: TONES.teal, description: '看你偏好什麼樣的工作內容與環境。',
    },
    'emotional-intelligence': {
        system: 'practical', icon: 'mdi-emoticon-outline', tone: TONES.plum, description: '看你怎麼覺察、理解與調節自己和他人的情緒。',
    },
    'attachment-style': {
        system: 'practical', icon: 'mdi-account-heart-outline', tone: TONES.rose, description: '看你在親近關係中靠近與保持距離的傾向。',
    },
    'core-values': {
        system: 'practical', icon: 'mdi-compass-outline', tone: TONES.steel, description: '選出對你最重要的價值，看它們如何影響你的選擇。',
    },
    'psychological-needs': {
        system: 'practical', icon: 'mdi-battery-heart-outline', tone: TONES.violet, description: '看自主、勝任與關係三種需求，哪些被滿足、哪些還有空間。',
    },
};

/** The order the cards are listed in, within the kind they belong to */
const CARD_ORDER: readonly AssessmentId[] = [
    'enneagram',
    'hexaco',
    'core-values',
    'psychological-needs',
    'riasec',
    'via-strengths',
    'emotional-intelligence',
    'attachment-style',
];

export type AssessmentCard = AssessmentCardInfo & {
    id: AssessmentId;
    title: string;
    /** Taking the test is the way in; the result is where it leads once there is one */
    takeTo: string;
    resultTo: string;
    kind: AssessmentDefinition['kind'];
};

/** The self-analyses whose entrances are turned on, one card each */
export function assessmentCards(): AssessmentCard[] {
    return ASSESSMENTS
        .filter((definition) => ASSESSMENT_ENTRY_ENABLED[definition.id])
        .toSorted((a, b) => CARD_ORDER.indexOf(a.id) - CARD_ORDER.indexOf(b.id))
        .map((definition) => ({
            ...CARD_INFO[definition.id],
            id: definition.id,
            title: definition.title,
            kind: definition.kind,
            takeTo: `/assessment/${definition.id}`,
            resultTo: `/analysis/${definition.id}`,
        }));
}

/** Whether any entrance is on, so that nothing is asked of the server otherwise */
export const anyAssessmentEntry = () => assessmentCards().length > 0;
