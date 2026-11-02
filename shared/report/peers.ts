import {
    FIGURES_BY_DAY, figuresOn, 
} from '../constants/birthdayFigures';
import { BLOOD_FIGURES } from '../constants/peerFigures/bloodFigures';
import { MBTI_FIGURES } from '../constants/peerFigures/mbtiFigures';
import type { GroupFigure } from '../constants/peerFigures/parse';
import type {
    BloodType, MbtiType,
} from '../schemas/common';
import { isRealDate } from '../schemas/common';
import { kinOf } from '../utils/mayaKin';
import { lifePathNumber } from '../utils/numerology';
import type {
    PeerFigure, Peers,
} from './types';

/** How many people the card of a report shows each time */
export const PEERS_SHOWN = 3;

/** The Gregorian calendar was in use everywhere by this year only for the dates after it: older birth dates are not turned into a Kin or a number */
const FIRST_GREGORIAN_YEAR = 1583;

const withYear = (figure: GroupFigure): PeerFigure => ({
    name: figure.name,
    nameEn: figure.nameEn,
    detail: `${figure.year} 年生・${figure.role}${figure.source ? `（血型來源：${figure.source}）` : ''}`,
});

/** Some of the items chosen at random, none twice (a partial shuffle); all of them when there are not more than asked for */
export function randomPick<Item>(items: readonly Item[], count: number, random: () => number = Math.random): Item[] {
    const rest = [...items];

    for (let index = 0; index < Math.min(count, rest.length); index += 1) {
        const other = index + Math.floor(random() * (rest.length - index));
        const kept = rest[index] as Item;

        rest[index] = rest[other] as Item;
        rest[other] = kept;
    }

    return rest.slice(0, count);
}

/** The card with only the few people it shows, chosen anew each time */
export function showSome(peers: Peers, random: () => number = Math.random): Peers {
    return {
        ...peers, figures: randomPick(peers.figures, PEERS_SHOWN, random),
    };
}

/** The people of the dated list of birthdays, one for each day of a year of birth, with their whole date */
type DatedFigure = GroupFigure & { birthDate: string };

const DATED_FIGURES: readonly DatedFigure[] = Object.entries(FIGURES_BY_DAY).flatMap(([day, figures]) => figures.flatMap((figure) => {
    const birthDate = `${String(figure.year).padStart(4, '0')}-${day}`;

    return figure.year >= FIRST_GREGORIAN_YEAR && isRealDate(birthDate)
        ? [
            {
                ...figure, birthDate,
            },
        ]
        : [];
})).sort((first, second) => first.year - second.year);

const withDate = (figure: DatedFigure): PeerFigure => {
    const [
        year,
        month,
        day,
    ] = figure.birthDate.split('-').map(Number);

    return {
        name: figure.name, nameEn: figure.nameEn, detail: `${year} 年 ${month} 月 ${day} 日生・${figure.role}`,
    };
};

const peersOf = (title: string, figures: readonly PeerFigure[], note: string): Peers | null => (figures.length > 0
    ? {
        title, figures, note,
    }
    : null);

/** 星座: the people born on the same month and day */
export function sameBirthdayPeers(birthDate: string): Peers | null {
    const figures = figuresOn(birthDate);

    return figures
        ? peersOf('跟你同一天生日的偉人', figures.map(withYear), '只是同一天出生，與你的特質沒有因果關係。')
        : null;
}

/** 血型: people popular lists name for the blood type */
export function bloodPeers(bloodType: BloodType): Peers | null {
    if (bloodType === 'UNKNOWN') return null;

    return peersOf('相同血型的偉人', (BLOOD_FIGURES.get(bloodType) ?? []).map(withYear), '血型取自本人、所屬單位或媒體公開的資料（來源見各人），僅供參考；血型與個性沒有科學上的因果關係。');
}

/** MBTI: people whose type popular profiles guess at */
export function mbtiPeers(type: MbtiType): Peers | null {
    return peersOf('相同 MBTI 人格特質的偉人', (MBTI_FIGURES.get(type) ?? []).map(withYear), '這些人沒有做過我們的測驗，類型是外界依公開資料的推測，僅供參考。');
}

/** 瑪雅 Kin: the people of the list of birthdays with the same Kin */
export function kinPeers(birthDate: string): Peers | null {
    if (!isRealDate(birthDate)) return null;

    const { kinNumber } = kinOf(birthDate);
    const same = DATED_FIGURES.filter((figure) => kinOf(figure.birthDate).kinNumber === kinNumber);

    return peersOf('相同 Kin 的偉人', same.map(withDate), '只是 Kin 相同，與你的特質沒有因果關係；1583 年之前出生的人不列入。');
}

/** 生命靈數: the people of the list of birthdays with the same life path number */
export function numerologyPeers(birthDate: string): Peers | null {
    if (!isRealDate(birthDate)) return null;

    const number = lifePathNumber(birthDate);
    const same = DATED_FIGURES.filter((figure) => lifePathNumber(figure.birthDate) === number);

    return peersOf('相同生命靈數的偉人', same.map(withDate), '只是數字相同，與你的特質沒有因果關係；1583 年之前出生的人不列入。');
}
