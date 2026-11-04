export type SystemKey = 'symbolic' | 'personality';

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
