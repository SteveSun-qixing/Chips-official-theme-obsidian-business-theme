import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVariableRefs, readThemeContract, readComponentStyle } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CSS Variables', () => {
  const contract = readThemeContract();

  it('should satisfy variable reference requirements by component contract', () => {
    contract.components.forEach((component) => {
      const content = readComponentStyle(component.file);
      const refs = getVariableRefs(content);
      expect(refs.length, `${component.file} should reference enough CSS variables`).toBeGreaterThanOrEqual(
        component.minVariableRefs
      );
    });
  });

  it('should use chips-prefixed CSS variables only', () => {
    const componentsDir = path.join(__dirname, '..', 'components');
    const componentFiles = fs.readdirSync(componentsDir).filter((file) => file.endsWith('.css'));

    componentFiles.forEach((file) => {
      const content = readComponentStyle(file);
      const varMatches = content.match(/var\(--[^)]+\)/g) || [];

      varMatches.forEach((varRef) => {
        expect(varRef).toMatch(/^var\(--chips-[a-z0-9-]+(?:,\s*[^)]+)?\)$/);
      });
    });
  });
});
