import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Animations', () => {
  it('contains required animation files', () => {
    const keyframesPath = path.join(__dirname, '..', 'animations', 'keyframes.css');
    const transitionsPath = path.join(__dirname, '..', 'animations', 'transitions.css');
    expect(fs.existsSync(keyframesPath)).toBe(true);
    expect(fs.existsSync(transitionsPath)).toBe(true);
  });

  it('keeps keyframe and transition definitions', () => {
    const keyframes = fs.readFileSync(path.join(__dirname, '..', 'animations', 'keyframes.css'), 'utf-8');
    const transitions = fs.readFileSync(path.join(__dirname, '..', 'animations', 'transitions.css'), 'utf-8');
    expect(keyframes).toContain('@keyframes');
    expect(transitions).toContain('.chips-transition');
  });
});
