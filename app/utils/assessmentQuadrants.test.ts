import {
    describe, expect, it,
} from 'vitest';
import { ASSESSMENTS } from '../../shared/assessments';
import { quadrantLayoutOf } from './assessmentQuadrants';

describe('quadrant layouts', () => {
    const quadrantAssessments = ASSESSMENTS.filter((definition) => definition.kind === 'scale' && definition.view === 'quadrant');

    it.each(quadrantAssessments.map((definition) => [definition.id, definition] as const))('%s has a layout that names every quadrant and uses its two dimensions', (id, definition) => {
        const layout = quadrantLayoutOf(id);
        const dimensions = definition.kind === 'scale' ? (definition.dimensions ?? []).map((info) => info.id) : [];

        expect(dimensions).toEqual(expect.arrayContaining([layout.rowDimension, layout.columnDimension]));
        expect(new Set(layout.cells).size).toBe(4);
        expect(layout.cells.every((cell) => layout.names[cell] !== undefined)).toBe(true);
        expect(definition.allContentKeys.sort()).toEqual(layout.cells.map((cell) => `${id}_quadrant-${cell}`).sort());
    });

    it('throws for an assessment that has none', () => {
        expect(() => quadrantLayoutOf('enneagram')).toThrow();
    });
});
