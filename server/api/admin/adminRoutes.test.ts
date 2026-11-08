import {
    readdirSync, readFileSync, statSync,
} from 'node:fs';
import {
    dirname, join,
} from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    describe, expect, it,
} from 'vitest';

const root = dirname(fileURLToPath(import.meta.url));

function handlerFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);

        if (statSync(path).isDirectory()) return handlerFiles(path);

        return /^(?!.*\.test\.ts$).*\.ts$/.test(name) ? [path] : [];
    });
}

describe('every /api/admin/* handler', () => {
    const files = handlerFiles(root);

    it('exists', () => {
        expect(files.length).toBeGreaterThan(0);
    });

    it.each(files.map((file) => [file.slice(root.length + 1), file]))('%s asks for the administrator before anything else', (_name, file) => {
        const source = readFileSync(file, 'utf8');
        const call = source.indexOf('await requireAdmin(event)');

        expect(call).toBeGreaterThan(-1);
        // Nothing is read from the request before the check
        expect(source.indexOf('getQuery(event)')).toSatisfy((at: number) => at === -1 || at > call);
        expect(source.indexOf('readBody(event)')).toSatisfy((at: number) => at === -1 || at > call);
        expect(source.indexOf('getRouterParam(event')).toSatisfy((at: number) => at === -1 || at > call);
    });
});
