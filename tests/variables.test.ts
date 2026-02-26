import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVariableRefs, readThemeContract, readComponentStyle } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedPrefixes = ['--chips-sys-', '--chips-comp-', '--chips-layout-', '--chips-motion-'];

describe('CSS Variables', () => {
  const contract = readThemeContract();

  it('satisfies variable reference requirements from contract', () => {
    contract.components.forEach((component) => {
      const refs = getVariableRefs(readComponentStyle(component.file));
      expect(refs.length, `${component.file} should reference enough CSS variables`).toBeGreaterThanOrEqual(
        component.minVariableRefs
      );
    });
  });

  it('keeps var() usage on layered namespace only', () => {
    const componentsDir = path.join(__dirname, '..', 'components');
    const componentFiles = fs.readdirSync(componentsDir).filter((file) => file.endsWith('.css'));

    componentFiles.forEach((file) => {
      const content = readComponentStyle(file);
      const varMatches = content.match(/var\(--[^)]+\)/g) || [];
      varMatches.forEach((variableRef) => {
        expect(variableRef.startsWith('var(--chips-')).toBe(true);
        const token = variableRef.slice(4).split(',')[0].trim();
        expect(allowedPrefixes.some((prefix) => token.startsWith(prefix))).toBe(true);
      });
    });
  });
});
