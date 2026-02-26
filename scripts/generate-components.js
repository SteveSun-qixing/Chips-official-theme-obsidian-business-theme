import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(ROOT_DIR, 'contracts', 'theme-interface.contract.json');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');

function readContract() {
  if (!fs.existsSync(CONTRACT_PATH)) {
    throw new Error('theme interface contract not found');
  }
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf-8'));
}

function ensureDirectory() {
  if (!fs.existsSync(COMPONENTS_DIR)) {
    fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
  }
}

function buildComponentCss(component) {
  const scope = component.interfacePoints.scope;
  const classSelectors = component.interfacePoints.classSelectors;
  const requiredSelectors = component.requiredSelectors;
  const parts = component.interfacePoints.parts;

  const rootAnchor = `[data-scope="${scope}"][data-part="root"]`;
  const rootSelectors = Array.from(new Set([requiredSelectors[0], ...classSelectors, rootAnchor]));

  const lines = [];
  lines.push(`/* ${component.name} | generated from contract */`);
  lines.push(`${rootSelectors.join(',\n')} {`);
  lines.push('  display: grid;');
  lines.push('  gap: var(--chips-layout-space-2);');
  lines.push('  padding: var(--chips-layout-space-3);');
  lines.push('  border: 1px solid var(--chips-sys-color-border-default);');
  lines.push('  border-radius: var(--chips-layout-radius-md);');
  lines.push('  background: var(--chips-sys-color-surface);');
  lines.push('  color: var(--chips-sys-color-text-primary);');
  lines.push('  box-shadow: var(--chips-comp-elevation-sm);');
  lines.push('  font-family: var(--chips-sys-font-family-ui);');
  lines.push('  font-size: var(--chips-sys-font-size-sm);');
  lines.push('  line-height: var(--chips-sys-font-line-height-normal);');
  lines.push('  transition: border-color var(--chips-motion-duration-fast) var(--chips-motion-easing-standard),');
  lines.push('    box-shadow var(--chips-motion-duration-fast) var(--chips-motion-easing-standard),');
  lines.push('    background var(--chips-motion-duration-fast) var(--chips-motion-easing-standard);');
  lines.push('}');
  lines.push('');

  lines.push(`${rootAnchor}:focus-visible {`);
  lines.push('  outline: none;');
  lines.push('  box-shadow: 0 0 0 3px var(--chips-sys-color-state-focus), var(--chips-comp-elevation-sm);');
  lines.push('  border-color: var(--chips-sys-color-brand);');
  lines.push('}');
  lines.push('');

  parts
    .filter((part) => part !== 'root')
    .forEach((part) => {
      const selector = `[data-scope="${scope}"] [data-part="${part}"]`;
      lines.push(`${selector} {`);
      lines.push('  color: var(--chips-sys-color-text-primary);');
      lines.push('  border-radius: var(--chips-layout-radius-sm);');
      lines.push('  transition: color var(--chips-motion-duration-fast) var(--chips-motion-easing-standard);');
      lines.push('}');
      lines.push('');
    });

  requiredSelectors.forEach((selector) => {
    if (rootSelectors.includes(selector)) {
      return;
    }
    lines.push(`${selector} {`);
    lines.push('  color: var(--chips-sys-color-text-primary);');
    lines.push('  border-color: var(--chips-sys-color-border-default);');
    lines.push('}');
    lines.push('');
  });

  lines.push(`[data-scope="${scope}"][data-state="active"] {`);
  lines.push('  border-color: var(--chips-sys-color-brand);');
  lines.push('  box-shadow: var(--chips-comp-elevation-sm);');
  lines.push('}');
  lines.push('');

  lines.push(`[data-scope="${scope}"][data-disabled], [data-scope="${scope}"][aria-disabled="true"] {`);
  lines.push('  opacity: var(--chips-comp-opacity-disabled, 0.56);');
  lines.push('  cursor: not-allowed;');
  lines.push('}');

  return `${lines.join('\n')}\n`;
}

function main() {
  ensureDirectory();
  const contract = readContract();
  const files = contract.components;

  files.forEach((component) => {
    const filePath = path.join(COMPONENTS_DIR, component.file);
    const content = buildComponentCss(component);
    fs.writeFileSync(filePath, content);
  });

  console.log(`Generated ${files.length} component style files from contract`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
