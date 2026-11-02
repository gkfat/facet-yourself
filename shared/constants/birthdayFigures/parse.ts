/**
 * Historical people born on each day of the year, three for every day (366 with 29 February). Fixed text, written once
 * and reviewed, never produced by AI. Only people whose birth date can be checked in a public biography are listed.
 */
export type BirthdayFigure = {
    name: string;
    /** The name as it is written in English */
    nameEn: string;
    /** The year of birth */
    year: number;
    /** One line on who the person is */
    role: string;
};

export type DayFigures = readonly [BirthdayFigure, BirthdayFigure, BirthdayFigure];

/** MM-DD|name|English name|year|role, then the same three fields for the second and the third person: one line for each day of the month */
export function parseFigureTable(table: string): Record<string, DayFigures> {
    return Object.fromEntries(table.trim().split('\n').map((line): [string, DayFigures] => {
        const [day = '', ...cells] = line.split('|').map((cell) => cell.trim());
        const figureAt = (start: number): BirthdayFigure => ({
            name: cells[start] ?? '', nameEn: cells[start + 1] ?? '', year: Number(cells[start + 2]), role: cells[start + 3] ?? '',
        });

        return [
            day, [
                figureAt(0),
                figureAt(4),
                figureAt(8),
            ],
        ];
    }));
}
