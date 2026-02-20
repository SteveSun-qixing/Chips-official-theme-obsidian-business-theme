import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readThemeContract } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Component Styles', () => {
  const componentsDir = path.join(__dirname, '..', 'components');
  const contract = readThemeContract();
  const requiredComponents = contract.components.map((component) => component.file);

  it('should have all 24 required component style files', () => {
    expect(requiredComponents.length).toBe(24);

    requiredComponents.forEach(file => {
      const filePath = path.join(componentsDir, file);
      expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
    });
  });

  it('should keep component styles non-trivial', () => {
    requiredComponents.forEach((file) => {
      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
      expect(lines.length, `${file} should have enough style rules`).toBeGreaterThanOrEqual(14);
    });
  });
});
