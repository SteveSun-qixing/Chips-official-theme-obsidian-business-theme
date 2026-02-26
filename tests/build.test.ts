import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { readThemeContract } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Build Outputs', () => {
  const distRoot = path.join(__dirname, '..', 'dist');
  const contract = readThemeContract();

  beforeAll(() => {
    if (!fs.existsSync(path.join(distRoot, 'theme.css'))) {
      execSync('npm run build', { stdio: 'inherit' });
    }
  });

  it('contains required dist entry outputs', () => {
    expect(fs.existsSync(path.join(distRoot, 'theme.css'))).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'tokens', 'global.css'))).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'icons', 'icons.css'))).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'animations', 'transitions.css'))).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'animations', 'keyframes.css'))).toBe(true);
  });

  it('keeps dist/components aligned with contract', () => {
    const distComponentsDir = path.join(distRoot, 'components');
    const actual = fs.readdirSync(distComponentsDir).filter((file) => file.endsWith('.css')).sort();
    const expected = contract.components.map((component) => component.file).sort();
    expect(actual).toEqual(expected);
  });
});
