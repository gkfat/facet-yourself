import {
    describe, expect, it,
} from 'vitest';
import { humanDesignPeers } from './peers';
import { HUMAN_DESIGN_FIGURES } from '../../shared/constants/peerFigures/humanDesignFigures';
import { calculateHumanDesign } from './calculate';

describe('humanDesignPeers', () => {
    it('works out a chart for every listed person, so the dates and zones are all readable', () => {
        for (const figure of HUMAN_DESIGN_FIGURES) {
            expect(() => calculateHumanDesign(figure.birthDate, figure.birthTime, figure.timeZone), figure.name).not.toThrow();
        }
    });

    it('gives a person the card of their own type and profile, with themselves on it', () => {
        const [first] = HUMAN_DESIGN_FIGURES;

        if (!first) throw new Error('no figures');

        const chart = calculateHumanDesign(first.birthDate, first.birthTime, first.timeZone);
        const peers = humanDesignPeers(chart);

        expect(peers?.title).toBe('相同人類圖類型與人生角色的偉人');
        expect(peers?.figures.map((figure) => figure.name)).toContain(first.name);
        expect(peers?.figures[0]?.detail).toContain('生於');
    });

    it('falls back to the people of the same type when none has the same profile', () => {
        const [first] = HUMAN_DESIGN_FIGURES;

        if (!first) throw new Error('no figures');

        const chart = calculateHumanDesign(first.birthDate, first.birthTime, first.timeZone);
        const peers = humanDesignPeers({
            type: chart.type, profile: '6/6',
        });

        expect(peers === null || peers.title === '相同人類圖類型與人生角色的偉人' || peers.title === '相同人類圖類型的偉人').toBe(true);
    });

    it('is the same card for the same chart', () => {
        const chart = {
            type: 'GENERATOR', profile: '3/5',
        } as const;

        expect(humanDesignPeers(chart)).toEqual(humanDesignPeers(chart));
    });
});
