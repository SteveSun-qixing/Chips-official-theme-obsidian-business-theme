import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Dark Mode', () => {
  it('should have dark mode token definitions', () => {
    const colorTokenPath = path.join(__dirname, '..', 'tokens', 'color.json');
    expect(fs.existsSync(colorTokenPath)).toBe(true);

    const content = fs.readFileSync(colorTokenPath, 'utf-8');
    const tokens = JSON.parse(content);

    // 验证有色板定义
    expect(tokens.chips.palette).toBeDefined();
    expect(tokens.chips.color).toBeDefined();
    expect(tokens.chips.color.background.value).toBe('{chips.palette.neutral.50}');
    expect(tokens.chips.color.text.value).toBe('{chips.palette.neutral.900}');
  });

  it('should declare dark mode manifest contract', () => {
    const manifestPath = path.join(__dirname, '..', 'manifest.yaml');
    const manifest = fs.readFileSync(manifestPath, 'utf-8');
    expect(manifest).toContain('darkMode: true');
    expect(manifest).toContain('inherits: "chips-official.default-theme"');
  });
});
