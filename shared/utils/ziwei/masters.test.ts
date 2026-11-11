import {
    describe, expect, it,
} from 'vitest';
import {
    bodyMasterOf,
    lifeMasterOf,
} from './masters';

describe('masters', () => {
    it('looks up 命主 by the life palace and 身主 by the year branch', () => {
        expect(lifeMasterOf('子')).toBe('貪狼');
        expect(bodyMasterOf('子')).toBe('火星');
        expect(lifeMasterOf('午')).toBe('破軍');
        expect(bodyMasterOf('亥')).toBe('天機');
    });

    it('gives branches that share a master the same star', () => {
        expect(lifeMasterOf('巳')).toBe(lifeMasterOf('未'));
        expect(bodyMasterOf('子')).toBe(bodyMasterOf('午'));
    });
});
