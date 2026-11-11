import type { Branch } from '../../constants/bazi';
import {
    BODY_MASTER_BY_BRANCH,
    LIFE_MASTER_BY_LIFE_BRANCH,
} from '../../constants/ziwei';

/** 命主 by the branch of the life palace. */
export function lifeMasterOf(lifeBranch: Branch): string {
    return LIFE_MASTER_BY_LIFE_BRANCH[lifeBranch];
}

/** 身主 by the birth-year branch. */
export function bodyMasterOf(yearBranch: Branch): string {
    return BODY_MASTER_BY_BRANCH[yearBranch];
}
