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

  it('covers all active contract components and selectors', () => {
    const componentFiles = fs.readdirSync(componentsDir).filter((file) => file.endsWith('.css')).sort();
    const expectedFiles = contract.components.map((component) => component.file).sort();
    expect(componentFiles).toEqual(expectedFiles);

    contract.components.forEach((component) => {
      const content = readComponentStyle(component.file);
      component.interfacePoints.classSelectors.forEach((selector) => {
        expect(content, `${component.file} should contain ${selector}`).toContain(selector);
      });
      component.requiredSelectors.forEach((selector) => {
        expect(content, `${component.file} should contain ${selector}`).toContain(selector);
      });
    });
  });

  it('rejects placeholder scaffold markers', () => {
    contract.components.forEach((component) => {
      const content = readComponentStyle(component.file);
      contract.placeholderMarkers.forEach((marker) => {
        expect(content.includes(marker), `${component.file} still contains placeholder marker: ${marker}`).toBe(false);
      });
    });
  });
});
