import { QUADRANT_NAMES as ATTACHMENT_QUADRANT_NAMES } from '../../shared/assessments/attachmentStyle';
import { CONFLICT_QUADRANT_NAMES } from '../../shared/assessments/conflictStyle';

/** How the result page of a two-dimension assessment lays out its map of the four quadrants */
export type QuadrantLayout = {
    /** The dimension that runs down the map (low on top, high below) and the one that runs across (low on the left, high on the right) */
    rowDimension: string;
    columnDimension: string;
    rowLabels: readonly [string, string];
    columnLabels: readonly [string, string];
    /** The names of the quadrants by id, and the ids in the order the map lays them out: top left, top right, bottom left, bottom right */
    names: Readonly<Record<string, string>>;
    cells: readonly [string, string, string, string];
    /** What the field of the content that tells about the setting of the assessment (the love style field) is called */
    settingLabel: string;
};

const LAYOUTS: Readonly<Record<string, QuadrantLayout>> = {
    'attachment-style': {
        rowDimension: 'anxiety',
        columnDimension: 'avoidance',
        rowLabels: ['焦慮低', '焦慮高'],
        columnLabels: ['迴避低', '迴避高'],
        names: ATTACHMENT_QUADRANT_NAMES,
        cells: [
            'steady',
            'independent',
            'close',
            'torn',
        ],
        settingLabel: '在關係中',
    },
    'conflict-style': {
        rowDimension: 'goals',
        columnDimension: 'relationship',
        rowLabels: ['目標低', '目標高'],
        columnLabels: ['關係低', '關係高'],
        names: CONFLICT_QUADRANT_NAMES,
        cells: [
            'avoiding',
            'accommodating',
            'assertive',
            'collaborating',
        ],
        settingLabel: '在衝突中',
    },
};

/** The layout of an assessment whose result is a position on two dimensions; an assessment of the quadrant view that has none is a mistake in this file, so it throws */
export function quadrantLayoutOf(assessmentId: string): QuadrantLayout {
    const layout = LAYOUTS[assessmentId];

    if (!layout) throw new Error(`No quadrant layout for the assessment ${assessmentId}`);

    return layout;
}
