import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { readThemeContract } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLibraryContractPath = path.resolve(
  __dirname,
  '..',
  '..',
  'Chips-ComponentLibrary',
  'packages',
  'component-library',
  'contracts',
  'theme-interface-points.contract.json'
);

describe('Theme Contract Sync', () => {
  it('should stay aligned with the component-library interface contract source', () => {
    expect(fs.existsSync(componentLibraryContractPath), 'component-library contract source should exist').toBe(true);

    const componentLibraryContract = JSON.parse(
      fs.readFileSync(componentLibraryContractPath, 'utf-8')
    ) as ReturnType<typeof readThemeContract>;
    const themeContract = readThemeContract();

    const normalize = (contract: ReturnType<typeof readThemeContract>) =>
      contract.components.map((component) => ({
        name: component.name,
        exportName: component.exportName,
        sourceFile: component.sourceFile,
        file: component.file,
        interfacePoints: component.interfacePoints,
      }));

    expect(normalize(themeContract)).toEqual(normalize(componentLibraryContract));
  });
});
