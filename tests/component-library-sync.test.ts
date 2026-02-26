import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { readThemeContract } from './theme-contract.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLibraryContractPathCandidates = [
  path.resolve(
    __dirname,
    '..',
    '..',
    'Chips-ComponentLibrary',
    'packages',
    'component-library',
    'contracts',
    'theme-interface-points.contract.json'
  ),
  path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'Chips-ComponentLibrary',
    'packages',
    'component-library',
    'contracts',
    'theme-interface-points.contract.json'
  ),
  path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'Chips-ComponentLibrary',
    'packages',
    'component-library',
    'contracts',
    'theme-interface-points.contract.json'
  )
];

const componentLibraryContractPath =
  componentLibraryContractPathCandidates.find((candidate) => fs.existsSync(candidate)) ??
  componentLibraryContractPathCandidates[0];

describe('Theme Contract Sync', () => {
  it('stays aligned with the component-library contract source', () => {
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
        requiredSelectors: component.requiredSelectors,
        minVariableRefs: component.minVariableRefs,
      }));

    expect(normalize(themeContract)).toEqual(normalize(componentLibraryContract));
  });
});
