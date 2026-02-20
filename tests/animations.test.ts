import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Animations', () => {
  it('should have transitions.css file', () => {
    const transitionsPath = path.join(__dirname, '..', 'animations', 'transitions.css');
    expect(fs.existsSync(transitionsPath)).toBe(true);
  });

  it('should have keyframes.css file', () => {
    const keyframesPath = path.join(__dirname, '..', 'animations', 'keyframes.css');
    expect(fs.existsSync(keyframesPath)).toBe(true);
  });

  it('should define keyframe animations', () => {
    const keyframesPath = path.join(__dirname, '..', 'animations', 'keyframes.css');
    const content = fs.readFileSync(keyframesPath, 'utf-8');

    // 检查是否定义了关键帧动画
    expect(content).toContain('@keyframes');
    expect(content).toContain('chips-');
  });
});
