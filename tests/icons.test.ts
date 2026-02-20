import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Icons', () => {
  it('should have icons.css file', () => {
    const iconsPath = path.join(__dirname, '..', 'icons', 'icons.css');
    expect(fs.existsSync(iconsPath)).toBe(true);
  });

  it('should define icon CSS variables', () => {
    const iconsPath = path.join(__dirname, '..', 'icons', 'icons.css');
    const content = fs.readFileSync(iconsPath, 'utf-8');

    // 检查是否定义了图标变量
    expect(content).toContain('--chips-icon-');
    expect(content).toContain('url(');
  });
});
