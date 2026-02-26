import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Icons', () => {
  it('contains icons.css and svg assets', () => {
    const iconsCssPath = path.join(__dirname, '..', 'icons', 'icons.css');
    const svgDir = path.join(__dirname, '..', 'icons', 'svg');
    expect(fs.existsSync(iconsCssPath)).toBe(true);
    expect(fs.existsSync(svgDir)).toBe(true);

    const svgFiles = fs.readdirSync(svgDir).filter((file) => file.endsWith('.svg'));
    expect(svgFiles.length).toBeGreaterThanOrEqual(20);
  });

  it('uses sys icon axis variables and material axis settings', () => {
    const iconsCss = fs.readFileSync(path.join(__dirname, '..', 'icons', 'icons.css'), 'utf-8');
    expect(iconsCss).toContain('--chips-sys-icon-fill');
    expect(iconsCss).toContain('--chips-sys-icon-weight');
    expect(iconsCss).toContain('--chips-sys-icon-grade');
    expect(iconsCss).toContain('--chips-sys-icon-optical-size');
    expect(iconsCss).toContain('--chips-sys-icon-size');
    expect(iconsCss).toContain('font-variation-settings');
  });
});
