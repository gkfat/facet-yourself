/**
 * The app's colors, in one place. The theme (app/plugins/vuetify.ts) is built from these, and the
 * dimensions that carry a color of their own (a card's stripe, an icon's wash) read DIMENSION_TONES.
 *
 * Midnight blue leads; its neighbours on the wheel (indigo, steel, teal, violet) fill out the family,
 * and dusk copper is the one warm contrast, kept for points and small accents.
 */
export const PALETTE = {
    /** Main actions, links, active states */
    primary: '#2b3a6b',
    /** The deepest blue: dark bands and headings' ink */
    night: '#171f3d',
    /** Text on the page */
    ink: '#1b2038',
    secondary: '#5b6684',
    background: '#f2f3f7',
    /** A band that sits one step off the page: banners, the hero's paper */
    paper: '#e8eaf2',
    surface: '#ffffff',
    /** The warm contrast to the blues: points and small accents only */
    accent: '#b4694a',
    info: '#3f68a0',
    success: '#2e7b68',
    warning: '#a9702a',
    error: '#b84f5a',
} as const;

/** What each dimension is drawn in; every hue is muted enough to sit on white next to the primary */
export const TONES = {
    indigo: '#3b4ea0',
    steel: '#46688f',
    teal: '#2a7f8c',
    green: '#34805f',
    olive: '#77763a',
    copper: '#a86540',
    rose: '#b5525f',
    plum: '#8e4a85',
    violet: '#6a53a8',
} as const;

export type ToneKey = keyof typeof TONES;
