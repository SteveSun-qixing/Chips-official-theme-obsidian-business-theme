import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPECTED_ID = 'chips-official.obsidian-business-theme';
const REQUIRE_INHERITS = true;

describe('Manifest', () => {
  const manifestPath = path.join(__dirname, '..', 'manifest.yaml');

  it('keeps baseline required fields', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    expect(content).toContain('schemaVersion: "1.0.0"');
    expect(content).toContain(`id: "${EXPECTED_ID}"`);
    expect(content).toContain('type: "theme"');
    expect(content).toContain('tokens: "tokens/global.css"');
    expect(content).toContain('themeCss: "theme.css"');
    expect(content).toContain('tokensVersion: "1.0.0"');
    if (REQUIRE_INHERITS) {
      expect(content).toContain('inherits: "chips-official.default-theme"');
    }
  });

  it('uses package-root relative entry files only', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    expect(content.includes('dist/')).toBe(false);
  });

  it('keeps theme block whitelist and removes mode labels', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const lines = content.split('\n');
    const themeStart = lines.findIndex((line) => line.trim() === 'theme:');
    expect(themeStart).toBeGreaterThanOrEqual(0);

    const blockLines: string[] = [];
    for (let index = themeStart + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^[A-Za-z][^:]*:/.test(line)) {
        break;
      }
      blockLines.push(line);
    }

    const block = blockLines.join('\n');
    const keys = [...block.matchAll(/^\s{2}([A-Za-z0-9_-]+):/gm)].map((match) => match[1]).sort();
    const expected = REQUIRE_INHERITS ? ['inherits', 'tokensVersion'] : ['tokensVersion'];
    expect(keys).toEqual(expected);
    expect(content.includes('darkMode:')).toBe(false);
  });
});
