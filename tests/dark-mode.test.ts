import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Theme Semantics', () => {
  it('keeps single semantic manifest without dark/light labels', () => {
    const manifest = fs.readFileSync(path.join(__dirname, '..', 'manifest.yaml'), 'utf-8');
    expect(manifest).not.toContain('darkMode:');
    expect(manifest).not.toContain('lightMode:');
  });

  it('keeps archive legacy-tokens for migrated historical token files', () => {
    const legacyTokensDir = path.join(__dirname, '..', 'archive', 'legacy-tokens');
    expect(fs.existsSync(legacyTokensDir)).toBe(true);
    const files = fs.readdirSync(legacyTokensDir).filter((file) => file.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);
  });
});
