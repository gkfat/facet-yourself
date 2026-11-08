/**
 * The picture a person can share of a result: the dimension, what it says of them and the brand, drawn on a canvas.
 * Only what the page already shows goes in (never birth data, place, email or ids).
 */
export type ShareImageContent = {
    /** The dimension, e.g. 星座 */
    dimension: string;
    /** The result in a few characters, e.g. 牡羊座 */
    headline: string;
    /** The verdict in a sentence; may be empty */
    tagline: string;
    /** The dimension's own color */
    tone: string;
};

export const SHARE_IMAGE_WIDTH = 1080;
export const SHARE_IMAGE_HEIGHT = 1350;

const BRAND = 'Facet yourself';
const BRAND_SUB = '多維度自我分析';
/** The wordmark in light ink on a transparent ground (public/), drawn at the top left */
const LOGO_URL = '/logo-mark-light.png';
const LOGO_HEIGHT = 72;
const MARGIN = 72;
const FOOTER_RULE_Y = 1226;
const NIGHT = '#171f3d';
const SERIF = '"Noto Serif TC", "Songti TC", serif';
const SANS = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load ${url}`));
        image.src = url;
    });
}

type Measure = (text: string) => number;

/**
 * Break text into lines no wider than `maxWidth`, character by character (Chinese has no spaces to break at).
 * Past `maxLines` the last line ends in an ellipsis.
 */
export function wrapLines(text: string, maxWidth: number, measure: Measure, maxLines: number): string[] {
    const lines: string[] = [];
    let line = '';

    for (const character of [...text.trim()]) {
        if (character === '\n' || measure(line + character) > maxWidth) {
            lines.push(line);
            line = character === '\n' ? '' : character;
        } else {
            line += character;
        }
    }

    if (line) lines.push(line);

    if (lines.length <= maxLines) return lines;

    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1] ?? '';

    while (last && measure(`${last}…`) > maxWidth) last = [...last].slice(0, -1).join('');

    kept[maxLines - 1] = `${last}…`;

    return kept;
}

/** A small deterministic field of stars, so the same result always gets the same picture */
function stars(count: number): { x: number; y: number; r: number; a: number }[] {
    let seed = 7;
    const next = () => {
        seed = (seed * 16807) % 2147483647;

        return seed / 2147483647;
    };

    return Array.from({ length: count }, () => ({
        x: next() * SHARE_IMAGE_WIDTH,
        y: next() * SHARE_IMAGE_HEIGHT,
        r: 0.8 + next() * 1.6,
        a: 0.25 + next() * 0.5,
    }));
}

export async function drawShareImage(content: ShareImageContent): Promise<HTMLCanvasElement> {
    // Draw only once the fonts are in, or the card would be set in a fallback face
    await Promise.all([document.fonts.load(`700 100px ${SERIF}`, `${content.headline}${BRAND}`), document.fonts.load(`400 40px ${SANS}`, `${content.tagline}${content.dimension}${BRAND_SUB}`)]).catch((error: unknown) => {
        console.error('[share-image] fonts failed to load, drawing with fallbacks:', error);
    });

    const canvas = document.createElement('canvas');

    canvas.width = SHARE_IMAGE_WIDTH;
    canvas.height = SHARE_IMAGE_HEIGHT;

    const context = canvas.getContext('2d');

    if (!context) throw new Error('Canvas is not available');

    const centerX = SHARE_IMAGE_WIDTH / 2;

    context.fillStyle = NIGHT;
    context.fillRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);

    for (const star of stars(70)) {
        context.globalAlpha = star.a;
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        context.fill();
    }

    context.globalAlpha = 1;

    // The brand's three circles, in the dimension's color, with the person at the middle
    const radius = 170;
    const middleY = 520;

    for (const [offsetX, offsetY] of [
        [-96, -70],
        [96, -70],
        [0, 82],
    ] as const) {
        context.beginPath();
        context.arc(centerX + offsetX, middleY + offsetY, radius, 0, Math.PI * 2);
        context.fillStyle = content.tone;
        context.globalAlpha = 0.28;
        context.fill();
        context.globalAlpha = 0.85;
        context.strokeStyle = '#dfe6fb';
        context.lineWidth = 2.5;
        context.stroke();
    }

    context.globalAlpha = 1;
    context.fillStyle = '#e0a283';
    context.beginPath();
    context.arc(centerX, middleY - 20, 10, 0, Math.PI * 2);
    context.fill();

    context.textAlign = 'center';

    context.fillStyle = '#aebbe9';
    context.font = `500 34px ${SANS}`;
    context.letterSpacing = '10px';
    context.fillText(content.dimension, centerX, 860);
    context.letterSpacing = '0px';

    context.fillStyle = '#f4f6fc';
    context.font = `700 ${[...content.headline].length > 6 ? 96 : 128}px ${SERIF}`;
    context.fillText(content.headline, centerX, 1000);

    if (content.tagline) {
        context.fillStyle = '#c9d3f5';
        context.font = `400 40px ${SANS}`;

        const lines = wrapLines(content.tagline, SHARE_IMAGE_WIDTH - 220, (text) => context.measureText(text).width, 3);

        lines.forEach((line, index) => context.fillText(line, centerX, 1090 + index * 62));
    }

    // The wordmark, at the top left
    context.textAlign = 'left';

    try {
        const logo = await loadImage(LOGO_URL);
        const width = (logo.width / logo.height) * LOGO_HEIGHT;

        context.drawImage(logo, MARGIN, MARGIN, width, LOGO_HEIGHT);
    } catch (error) {
        console.error('[share-image] logo failed to load, writing the name instead:', error);
        context.fillStyle = '#f4f6fc';
        context.font = `700 40px ${SERIF}`;
        context.fillText(BRAND, MARGIN, MARGIN + 44);
    }

    // A hairline and what the product is, at the foot: the wordmark above and this line close the picture on the same edge
    context.fillStyle = 'rgba(143, 156, 204, 0.3)';
    context.fillRect(MARGIN, FOOTER_RULE_Y, SHARE_IMAGE_WIDTH - MARGIN * 2, 2);
    context.fillStyle = '#8f9ccc';
    context.font = `400 26px ${SANS}`;
    context.letterSpacing = '8px';
    context.fillText(BRAND_SUB, MARGIN, FOOTER_RULE_Y + 56);
    context.letterSpacing = '0px';

    return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the picture'))), 'image/png');
    });
}
