import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readThemeContract, readComponentStyle } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Component Coverage', () => {
  const componentsDir = path.join(__dirname, '..', 'components');
  const contract = readThemeContract();

  it('should cover all 24 components from the component library', () => {
    expect(contract.components.length).toBe(24);

    contract.components.forEach((component) => {
      const filePath = path.join(componentsDir, component.file);
      expect(fs.existsSync(filePath), `${component.file} should exist`).toBe(true);

      const content = readComponentStyle(component.file);
      expect(content, `${component.file} should contain ${component.baseSelector}`).toContain(component.baseSelector);
      component.requiredSelectors.forEach((selector) => {
        expect(content, `${component.file} should contain ${selector}`).toContain(selector);
      });
    });
  });

  it('should reject placeholder scaffold markers in component styles', () => {
    contract.components.forEach((component) => {
      const content = readComponentStyle(component.file);
      contract.placeholderMarkers.forEach((marker) => {
        expect(content.includes(marker), `${component.file} still contains placeholder marker: ${marker}`).toBe(false);
      });
    });
  });
});
