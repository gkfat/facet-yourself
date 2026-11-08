export type SystemKey = 'symbolic' | 'personality' | 'practical';

/** The kinds of analysis the app offers, in the order they are listed, with what each one is for; the home page and the page of the reports share it */
export const SYSTEMS: readonly {
    key: SystemKey;
    title: string;
    icon: string;
    purpose: string;
}[] = [
    {
        key: 'symbolic',
        title: '命理與象徵系統',
        icon: 'mdi-star-four-points-outline',
        purpose: '娛樂、文化探索、象徵性解讀',
    },
    {
        key: 'personality',
        title: '人格與心理系統',
        icon: 'mdi-head-cog-outline',
        purpose: '了解特質傾向與個人差異',
    },
    {
        key: 'practical',
        title: '自我探索與實用分析',
        icon: 'mdi-compass-outline',
        purpose: '釐清價值、動機與強項，用在選擇與關係上',
    },
];

export type Analysis = {
    key: string;
    system: SystemKey;
    title: string;
    icon: string;
    /** The accent of this analysis */
    tone: string;
    description: string;
    /** What the visitor has to provide */
    need: string;
    action: string;
    /** Shown on the disabled button */
    lockedHint: string;
    /** Whether the data it needs is there */
    ready: boolean;
    /** Where it leads; without one the content is still being planned. */
    to?: string;
};
