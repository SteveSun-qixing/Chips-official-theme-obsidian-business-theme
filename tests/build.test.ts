import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Style Dictionary Build', () => {
  const distTokensDir = path.join(__dirname, '..', 'dist', 'tokens');
  const distRoot = path.join(__dirname, '..', 'dist');

  beforeAll(() => {
    // 确保构建已运行
    if (!fs.existsSync(path.join(distRoot, 'theme.css')) || !fs.existsSync(distTokensDir)) {
      try {
        execSync('npm run build', { stdio: 'inherit' });
      } catch (error) {
        console.error('Failed to build theme assets');
      }
    }
  });

  it('should generate global.css in dist/tokens/', () => {
    const globalCssPath = path.join(distTokensDir, 'global.css');
    expect(fs.existsSync(globalCssPath)).toBe(true);
  });

  it('should output manifest-referenced theme entry files', () => {
    const tokenEntry = path.join(__dirname, '..', 'tokens', 'global.css');
    const themeCssEntry = path.join(distRoot, 'theme.css');
    expect(fs.existsSync(tokenEntry)).toBe(true);
    expect(fs.existsSync(themeCssEntry)).toBe(true);
  });
});
