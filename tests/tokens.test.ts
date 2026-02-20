import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Token Files', () => {
  const tokensDir = path.join(__dirname, '..', 'tokens');

  const requiredTokenFiles = [
    'color.json',
    'typography.json',
    'spacing.json',
    'radius.json',
    'shadow.json',
    'motion.json',
    'z-index.json',
    'breakpoint.json'
  ];

  it('should have all required token files', () => {
    requiredTokenFiles.forEach(file => {
      const filePath = path.join(tokensDir, file);
      expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
    });
  });

  it('should have valid JSON format in all token files', () => {
    requiredTokenFiles.forEach(file => {
      const filePath = path.join(tokensDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(() => {
        JSON.parse(content);
      }, `${file} should be valid JSON`).not.toThrow();
    });
  });
});
