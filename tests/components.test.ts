import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readThemeContract } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedPrefixes = ['--chips-sys-', '--chips-comp-', '--chips-layout-', '--chips-motion-'];

describe('Component Styles', () => {
  const componentsDir = path.join(__dirname, '..', 'components');
  const contract = readThemeContract();
  const requiredComponents = contract.components.map((component) => component.file);

  it('matches contract files exactly', () => {
    const actual = fs.readdirSync(componentsDir).filter((file) => file.endsWith('.css')).sort();
    const expected = [...requiredComponents].sort();
    expect(actual).toEqual(expected);
  });

  it('keeps component styles non-trivial', () => {
    requiredComponents.forEach((file) => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8').trim();
      const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
      expect(lines.length, `${file} should have enough style rules`).toBeGreaterThanOrEqual(12);
    });
  });

  it('uses only layered variable namespaces in component styles', () => {
    requiredComponents.forEach((file) => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      const vars = content.match(/--chips-[a-z0-9-]+/g) ?? [];
      const forbidden = [...new Set(vars.filter((token) => !allowedPrefixes.some((prefix) => token.startsWith(prefix))))];
      expect(forbidden, `${file} contains forbidden token namespaces`).toEqual([]);
    });
  });
});
