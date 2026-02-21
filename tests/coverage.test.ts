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

  it('should cover all active components from the component-library interface contract', () => {
    expect(contract.components.length).toBe(13);

    contract.components.forEach((component) => {
      const filePath = path.join(componentsDir, component.file);
      expect(fs.existsSync(filePath), `${component.file} should exist`).toBe(true);

      const content = readComponentStyle(component.file);
      component.interfacePoints.classSelectors.forEach((selector) => {
        expect(content, `${component.file} should contain ${selector}`).toContain(selector);
      });
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
