import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ThemeComponentContract {
  name: string;
  exportName: string;
  sourceFile: string;
  file: string;
  interfacePoints: {
    scope: string;
    classSelectors: string[];
    parts: string[];
  };
  requiredSelectors: string[];
  minVariableRefs: number;
}

export interface ThemeInterfaceContract {
  version: string;
  generatedAt: string;
  description: string;
  placeholderMarkers: string[];
  components: ThemeComponentContract[];
}

export function readThemeContract(): ThemeInterfaceContract {
  const contractPath = path.join(__dirname, '..', 'contracts', 'theme-interface.contract.json');
  const raw = fs.readFileSync(contractPath, 'utf-8');
  return JSON.parse(raw) as ThemeInterfaceContract;
}

export function readComponentStyle(file: string): string {
  const filePath = path.join(__dirname, '..', 'components', file);
  return fs.readFileSync(filePath, 'utf-8');
}

export function getVariableRefs(content: string): string[] {
  return content.match(/var\(--chips-[a-z0-9-]+(?:,\s*[^)]+)?\)/g) ?? [];
}
