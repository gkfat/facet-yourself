/** A well-known person listed for a group (a blood type, an MBTI type): name, English name, year of birth and one line on who they are. */
export type GroupFigure = {
    name: string;
    nameEn: string;
    year: number;
    role: string;
    /** Where the fact about the group comes from, when the list names it */
    source?: string;
};

/** group|name|English name|year|role, and the source when there is one: one line for each person; the lines of a group stay in the order they are written */
export function parseGroupTable<Group extends string>(table: string, groups: readonly Group[]): ReadonlyMap<Group, readonly GroupFigure[]> {
    const byGroup = new Map<Group, GroupFigure[]>(groups.map((group) => [group, []]));

    for (const line of table.trim().split('\n')) {
        const [
            group = '',
            name = '',
            nameEn = '',
            year = '',
            role = '',
            source,
        ] = line.split('|').map((cell) => cell.trim());
        const known = groups.find((candidate) => candidate === group);
        const list = known === undefined ? undefined : byGroup.get(known);

        if (!list) throw new RangeError(`Unknown group in the figure table: ${group}`);

        list.push({
            name, nameEn, year: Number(year), role, ...(source ? { source } : {}),
        });
    }

    return byGroup;
}
