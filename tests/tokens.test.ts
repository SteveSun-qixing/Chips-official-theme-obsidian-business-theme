import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hasPath } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function mergeDeep(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!(key in target)) {
        target[key] = {};
      }
      mergeDeep(target[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function collectRefs(input: unknown, refs: string[] = []): string[] {
  if (typeof input === 'string') {
    const matches = input.match(/\{[^}]+\}/g) ?? [];
    matches.forEach((match) => refs.push(match.replace(/[{}]/g, '')));
    return refs;
  }
  if (Array.isArray(input)) {
    input.forEach((item) => collectRefs(item, refs));
    return refs;
  }
  if (input && typeof input === 'object') {
    Object.values(input).forEach((value) => collectRefs(value, refs));
  }
  return refs;
}

describe('Token Files', () => {
  const tokensDir = path.join(__dirname, '..', 'tokens');
  const requiredTokenFiles = ['ref.json', 'sys.json', 'comp.json', 'motion.json', 'layout.json'];

  it('keeps token file set exactly on five-layer structure', () => {
    const actual = fs.readdirSync(tokensDir).filter((file) => file.endsWith('.json')).sort();
    const expected = [...requiredTokenFiles].sort();
    expect(actual).toEqual(expected);
  });

  it('keeps all token files parseable JSON', () => {
    requiredTokenFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(tokensDir, file), 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  it('covers required font/icon fields and fallback chain', () => {
    const ref = readJson(path.join(tokensDir, 'ref.json'));
    const sys = readJson(path.join(tokensDir, 'sys.json'));
    const comp = readJson(path.join(tokensDir, 'comp.json'));

    const requiredPaths = [
      ['chips', 'ref', 'font', 'family'],
      ['chips', 'ref', 'font', 'size'],
      ['chips', 'ref', 'font', 'weight'],
      ['chips', 'ref', 'font', 'lineHeight'],
      ['chips', 'ref', 'icon', 'fill'],
      ['chips', 'ref', 'icon', 'weight'],
      ['chips', 'ref', 'icon', 'grade'],
      ['chips', 'ref', 'icon', 'opticalSize'],
      ['chips', 'ref', 'icon', 'size'],
      ['chips', 'sys', 'font', 'family'],
      ['chips', 'sys', 'font', 'size'],
      ['chips', 'sys', 'font', 'weight'],
      ['chips', 'sys', 'font', 'lineHeight'],
      ['chips', 'sys', 'icon', 'fill'],
      ['chips', 'sys', 'icon', 'weight'],
      ['chips', 'sys', 'icon', 'grade'],
      ['chips', 'sys', 'icon', 'opticalSize'],
      ['chips', 'sys', 'icon', 'size'],
      ['chips', 'comp', 'icon', 'fill'],
      ['chips', 'comp', 'icon', 'weight'],
      ['chips', 'comp', 'icon', 'grade'],
      ['chips', 'comp', 'icon', 'opticalSize'],
      ['chips', 'comp', 'icon', 'size'],
    ];

    requiredPaths.forEach((pathParts) => {
      const source = pathParts[1] === 'ref' ? ref : pathParts[1] === 'sys' ? sys : comp;
      expect(hasPath(source, pathParts), `${pathParts.join('.')} should exist`).toBe(true);
    });

    expect(sys.chips.sys.icon.fill.value).toBe('{chips.ref.icon.fill}');
    expect(sys.chips.sys.icon.weight.value).toBe('{chips.ref.icon.weight}');
    expect(sys.chips.sys.icon.grade.value).toBe('{chips.ref.icon.grade}');
    expect(sys.chips.sys.icon.opticalSize.value).toBe('{chips.ref.icon.opticalSize}');
    expect(sys.chips.sys.icon.size.value).toBe('{chips.ref.icon.size}');

    expect(comp.chips.comp.icon.fill.value).toBe('{chips.sys.icon.fill}');
    expect(comp.chips.comp.icon.weight.value).toBe('{chips.sys.icon.weight}');
    expect(comp.chips.comp.icon.grade.value).toBe('{chips.sys.icon.grade}');
    expect(comp.chips.comp.icon.opticalSize.value).toBe('{chips.sys.icon.opticalSize}');
    expect(comp.chips.comp.icon.size.value).toBe('{chips.sys.icon.size}');
  });

  it('rejects unresolved token references and illegal icon axis values', () => {
    const parsed = requiredTokenFiles.map((file) => readJson(path.join(tokensDir, file)));
    const merged = parsed.reduce((acc, item) => mergeDeep(acc, item), {} as Record<string, unknown>);
    const refs = parsed.flatMap((item) => collectRefs(item));

    refs.forEach((reference) => {
      expect(hasPath(merged, reference.split('.')), `reference should resolve: {${reference}}`).toBe(true);
    });

    const ref = parsed[0] as {
      chips: {
        ref: {
          icon: {
            fill: { value: string };
            weight: { value: string };
            grade: { value: string };
            opticalSize: { value: string };
            size: { value: string };
          };
        };
      };
    };

    const fill = Number(ref.chips.ref.icon.fill.value);
    const weight = Number(ref.chips.ref.icon.weight.value);
    const grade = Number(ref.chips.ref.icon.grade.value);
    const opticalSize = Number(ref.chips.ref.icon.opticalSize.value);
    const size = Number(ref.chips.ref.icon.size.value.replace(/[^0-9.\-]/g, ''));

    expect([0, 1]).toContain(fill);
    expect(weight).toBeGreaterThanOrEqual(100);
    expect(weight).toBeLessThanOrEqual(700);
    expect(grade).toBeGreaterThanOrEqual(-50);
    expect(grade).toBeLessThanOrEqual(200);
    expect(opticalSize).toBeGreaterThanOrEqual(20);
    expect(opticalSize).toBeLessThanOrEqual(48);
    expect(size).toBeGreaterThan(0);
  });
});
