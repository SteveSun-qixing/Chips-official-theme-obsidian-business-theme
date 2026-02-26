import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CONFIG = {
  themeName: 'Chips Obsidian Business Theme',
  expectedId: 'chips-official.obsidian-business-theme',
  requireInherits: true,
};

/** @type {Array<{code:string,message:string,details?:unknown,retryable?:boolean}>} */
const errors = [];

function pushError(code, message, details, retryable = false) {
  errors.push({ code, message, details, retryable });
}

function readText(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    pushError('FILE_MISSING', `${relativePath} not found`);
    return null;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function readJson(relativePath, code = 'JSON_PARSE_FAILED') {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    pushError('FILE_MISSING', `${relativePath} not found`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (error) {
    pushError(code, `failed to parse ${relativePath}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function parseManifestBlock(manifestContent, key) {
  const lines = manifestContent.split('\n');
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start < 0) {
    return [];
  }

  const keys = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }
    if (!line.startsWith('  ')) {
      break;
    }
    const match = line.match(/^\s{2}([A-Za-z0-9_-]+):/);
    if (match) {
      keys.push(match[1]);
    }
  }

  return keys;
}

function hasPath(input, segments) {
  let current = input;
  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return false;
    }
    current = current[segment];
  }
  return true;
}

function getPath(input, segments) {
  let current = input;
  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') {
    return target;
  }
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!(key in target)) {
        target[key] = {};
      }
      mergeDeep(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function collectTokenReferences(input, accumulator = [], pointer = []) {
  if (typeof input === 'string') {
    const refMatches = input.match(/\{[^}]+\}/g) ?? [];
    for (const ref of refMatches) {
      accumulator.push({
        pointer: pointer.join('.'),
        reference: ref.replace(/[{}]/g, ''),
      });
    }
    return accumulator;
  }
  if (Array.isArray(input)) {
    input.forEach((item, index) => collectTokenReferences(item, accumulator, [...pointer, String(index)]));
    return accumulator;
  }
  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input)) {
      collectTokenReferences(value, accumulator, [...pointer, key]);
    }
  }
  return accumulator;
}

function validateManifest() {
  const manifest = readText('manifest.yaml');
  if (!manifest) {
    return;
  }

  const requiredSnippets = [
    'schemaVersion: "1.0.0"',
    `id: "${CONFIG.expectedId}"`,
    'type: "theme"',
    'tokens: "tokens/global.css"',
    'themeCss: "theme.css"',
  ];

  for (const snippet of requiredSnippets) {
    if (!manifest.includes(snippet)) {
      pushError('MANIFEST_REQUIRED_FIELD_MISSING', `manifest missing required snippet: ${snippet}`);
    }
  }

  if (manifest.includes('dist/')) {
    pushError('MANIFEST_ENTRY_INVALID', 'manifest entries must be package-root relative and cannot use dist/ prefix');
  }

  if (manifest.includes('darkMode:')) {
    pushError('MANIFEST_THEME_MODE_FORBIDDEN', 'manifest must not contain mode labels such as darkMode');
  }

  const themeKeys = parseManifestBlock(manifest, 'theme');
  if (themeKeys.length === 0) {
    pushError('MANIFEST_THEME_BLOCK_MISSING', 'manifest theme block is missing');
    return;
  }

  const allowedThemeKeys = ['tokensVersion', 'inherits'];
  const unknownThemeKeys = themeKeys.filter((key) => !allowedThemeKeys.includes(key));
  const missingTokensVersion = !themeKeys.includes('tokensVersion');
  const missingInherits = CONFIG.requireInherits && !themeKeys.includes('inherits');

  if (unknownThemeKeys.length > 0 || missingTokensVersion || missingInherits) {
    pushError('MANIFEST_THEME_WHITELIST_FAILED', 'theme block must only use tokensVersion/inherits and satisfy required fields', {
      themeKeys,
      unknownThemeKeys,
      missingTokensVersion,
      missingInherits,
    });
  }
}

function resolveComponentLibraryContractPath() {
  const candidates = [
    path.resolve(ROOT_DIR, '..', 'Chips-ComponentLibrary', 'packages', 'component-library', 'contracts', 'theme-interface-points.contract.json'),
    path.resolve(ROOT_DIR, '..', '..', 'Chips-ComponentLibrary', 'packages', 'component-library', 'contracts', 'theme-interface-points.contract.json'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

function validateContractAndComponents() {
  const contract = readJson('contracts/theme-interface.contract.json', 'THEME_CONTRACT_PARSE_FAILED');
  if (!contract || !Array.isArray(contract.components)) {
    pushError('THEME_CONTRACT_INVALID', 'theme contract must contain a components array');
    return;
  }

  const componentLibraryContractPath = resolveComponentLibraryContractPath();
  if (!fs.existsSync(componentLibraryContractPath)) {
    pushError('COMPONENT_LIBRARY_CONTRACT_MISSING', 'component-library contract source is missing', {
      componentLibraryContractPath,
    });
  } else {
    const componentLibraryContract = JSON.parse(fs.readFileSync(componentLibraryContractPath, 'utf-8'));
    const normalize = (input) =>
      input.components.map((component) => ({
        name: component.name,
        exportName: component.exportName,
        sourceFile: component.sourceFile,
        file: component.file,
        interfacePoints: component.interfacePoints,
        requiredSelectors: component.requiredSelectors,
        minVariableRefs: component.minVariableRefs,
      }));

    const localNormalized = JSON.stringify(normalize(contract));
    const sourceNormalized = JSON.stringify(normalize(componentLibraryContract));
    if (localNormalized !== sourceNormalized) {
      pushError('CONTRACT_SYNC_MISMATCH', 'theme contract is not aligned with component-library contract source');
    }
  }

  const componentDir = path.join(ROOT_DIR, 'components');
  if (!fs.existsSync(componentDir)) {
    pushError('COMPONENTS_DIR_MISSING', 'components directory is missing');
    return;
  }

  const expectedFiles = contract.components.map((component) => component.file).sort();
  const actualFiles = fs.readdirSync(componentDir).filter((file) => file.endsWith('.css')).sort();

  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  if (missing.length > 0 || extra.length > 0) {
    pushError('COMPONENT_CONTRACT_MISMATCH', 'components directory must exactly match contract files', {
      missing,
      extra,
    });
  }

  const themeCss = readText('theme.css');
  if (!themeCss) {
    return;
  }

  const imports = [...themeCss.matchAll(/@import '\.\/components\/(.+?)';/g)].map((match) => match[1]);
  const importMissing = expectedFiles.filter((file) => !imports.includes(file));
  const importExtra = imports.filter((file) => !expectedFiles.includes(file));
  if (importMissing.length > 0 || importExtra.length > 0) {
    pushError('THEME_ENTRY_IMPORT_MISMATCH', 'theme.css component imports must exactly match contract files', {
      importMissing,
      importExtra,
    });
  }
}

function validateTokens() {
  const requiredTokenFiles = ['ref.json', 'sys.json', 'comp.json', 'motion.json', 'layout.json'];
  const tokensDir = path.join(ROOT_DIR, 'tokens');

  if (!fs.existsSync(tokensDir)) {
    pushError('TOKENS_DIR_MISSING', 'tokens directory is missing');
    return;
  }

  const tokenFiles = fs.readdirSync(tokensDir).filter((file) => file.endsWith('.json')).sort();
  const missingFiles = requiredTokenFiles.filter((file) => !tokenFiles.includes(file));
  const extraFiles = tokenFiles.filter((file) => !requiredTokenFiles.includes(file));
  if (missingFiles.length > 0 || extraFiles.length > 0) {
    pushError('TOKEN_FILE_SET_INVALID', 'tokens directory must only contain five-layer token json files', {
      missingFiles,
      extraFiles,
    });
  }

  const parsed = {};
  for (const file of requiredTokenFiles) {
    parsed[file] = readJson(`tokens/${file}`, 'TOKEN_FILE_PARSE_FAILED');
  }

  if (Object.values(parsed).some((value) => value === null)) {
    return;
  }

  const ref = parsed['ref.json'];
  const sys = parsed['sys.json'];
  const comp = parsed['comp.json'];
  const motion = parsed['motion.json'];
  const layout = parsed['layout.json'];

  const requiredPaths = [
    ['ref.json', ['chips', 'ref', 'font', 'family']],
    ['ref.json', ['chips', 'ref', 'font', 'size']],
    ['ref.json', ['chips', 'ref', 'font', 'weight']],
    ['ref.json', ['chips', 'ref', 'font', 'lineHeight']],
    ['ref.json', ['chips', 'ref', 'icon', 'fill']],
    ['ref.json', ['chips', 'ref', 'icon', 'weight']],
    ['ref.json', ['chips', 'ref', 'icon', 'grade']],
    ['ref.json', ['chips', 'ref', 'icon', 'opticalSize']],
    ['ref.json', ['chips', 'ref', 'icon', 'size']],
    ['sys.json', ['chips', 'sys', 'font', 'family']],
    ['sys.json', ['chips', 'sys', 'font', 'size']],
    ['sys.json', ['chips', 'sys', 'font', 'weight']],
    ['sys.json', ['chips', 'sys', 'font', 'lineHeight']],
    ['sys.json', ['chips', 'sys', 'icon', 'fill']],
    ['sys.json', ['chips', 'sys', 'icon', 'weight']],
    ['sys.json', ['chips', 'sys', 'icon', 'grade']],
    ['sys.json', ['chips', 'sys', 'icon', 'opticalSize']],
    ['sys.json', ['chips', 'sys', 'icon', 'size']],
    ['comp.json', ['chips', 'comp', 'icon', 'fill']],
    ['comp.json', ['chips', 'comp', 'icon', 'weight']],
    ['comp.json', ['chips', 'comp', 'icon', 'grade']],
    ['comp.json', ['chips', 'comp', 'icon', 'opticalSize']],
    ['comp.json', ['chips', 'comp', 'icon', 'size']],
    ['motion.json', ['chips', 'motion', 'easing']],
    ['motion.json', ['chips', 'motion', 'duration']],
    ['layout.json', ['chips', 'layout', 'space']],
    ['layout.json', ['chips', 'layout', 'radius']],
    ['layout.json', ['chips', 'layout', 'border-width']],
  ];

  for (const [file, pathParts] of requiredPaths) {
    if (!hasPath(parsed[file], pathParts)) {
      pushError('TOKEN_REQUIRED_FIELD_MISSING', `missing token field in ${file}: ${pathParts.join('.')}`);
    }
  }

  const mergedTokens = {};
  mergeDeep(mergedTokens, ref);
  mergeDeep(mergedTokens, sys);
  mergeDeep(mergedTokens, comp);
  mergeDeep(mergedTokens, motion);
  mergeDeep(mergedTokens, layout);

  const references = [
    ...collectTokenReferences(ref),
    ...collectTokenReferences(sys),
    ...collectTokenReferences(comp),
    ...collectTokenReferences(motion),
    ...collectTokenReferences(layout),
  ];

  for (const item of references) {
    const pathParts = item.reference.split('.');
    if (!hasPath(mergedTokens, pathParts)) {
      pushError('TOKEN_REFERENCE_BROKEN', `token reference target does not exist: {${item.reference}}`, item);
    }
  }

  const expectedFallbacks = [
    ['chips.sys.font.family.ui.value', '{chips.ref.font.family.ui}'],
    ['chips.sys.font.family.mono.value', '{chips.ref.font.family.mono}'],
    ['chips.sys.icon.fill.value', '{chips.ref.icon.fill}'],
    ['chips.sys.icon.weight.value', '{chips.ref.icon.weight}'],
    ['chips.sys.icon.grade.value', '{chips.ref.icon.grade}'],
    ['chips.sys.icon.opticalSize.value', '{chips.ref.icon.opticalSize}'],
    ['chips.sys.icon.size.value', '{chips.ref.icon.size}'],
    ['chips.comp.icon.fill.value', '{chips.sys.icon.fill}'],
    ['chips.comp.icon.weight.value', '{chips.sys.icon.weight}'],
    ['chips.comp.icon.grade.value', '{chips.sys.icon.grade}'],
    ['chips.comp.icon.opticalSize.value', '{chips.sys.icon.opticalSize}'],
    ['chips.comp.icon.size.value', '{chips.sys.icon.size}'],
  ];

  for (const [pointer, expectedValue] of expectedFallbacks) {
    const [fileName, ...rest] = pointer.startsWith('chips.comp') ? ['comp.json', ...pointer.split('.')]
      : pointer.startsWith('chips.sys') ? ['sys.json', ...pointer.split('.')]
      : ['ref.json', ...pointer.split('.')];
    const actualValue = getPath(parsed[fileName], rest);
    if (actualValue !== expectedValue) {
      pushError('TOKEN_FALLBACK_CHAIN_BROKEN', `token fallback chain mismatch at ${pointer}`, {
        expected: expectedValue,
        actual: actualValue,
      });
    }
  }

  const axisValues = {
    fill: Number(getPath(ref, ['chips', 'ref', 'icon', 'fill', 'value'])),
    weight: Number(getPath(ref, ['chips', 'ref', 'icon', 'weight', 'value'])),
    grade: Number(getPath(ref, ['chips', 'ref', 'icon', 'grade', 'value'])),
    opticalSize: Number(getPath(ref, ['chips', 'ref', 'icon', 'opticalSize', 'value'])),
    size: String(getPath(ref, ['chips', 'ref', 'icon', 'size', 'value']) ?? ''),
  };

  if (!Number.isFinite(axisValues.fill) || ![0, 1].includes(axisValues.fill)) {
    pushError('TOKEN_ICON_AXIS_INVALID', 'icon.fill must be 0 or 1', axisValues);
  }
  if (!Number.isFinite(axisValues.weight) || axisValues.weight < 100 || axisValues.weight > 700) {
    pushError('TOKEN_ICON_AXIS_INVALID', 'icon.weight must be in range 100-700', axisValues);
  }
  if (!Number.isFinite(axisValues.grade) || axisValues.grade < -50 || axisValues.grade > 200) {
    pushError('TOKEN_ICON_AXIS_INVALID', 'icon.grade must be in range -50-200', axisValues);
  }
  if (!Number.isFinite(axisValues.opticalSize) || axisValues.opticalSize < 20 || axisValues.opticalSize > 48) {
    pushError('TOKEN_ICON_AXIS_INVALID', 'icon.opticalSize must be in range 20-48', axisValues);
  }
  const sizeNumeric = Number(axisValues.size.replace(/[^0-9.\-]/g, ''));
  if (!Number.isFinite(sizeNumeric) || sizeNumeric <= 0) {
    pushError('TOKEN_ICON_AXIS_INVALID', 'icon.size must be a positive dimension', axisValues);
  }

  const tokenCss = readText('tokens/global.css');
  if (tokenCss === null) {
    pushError('TOKEN_ENTRY_MISSING', 'tokens/global.css not found');
  }
}

function validateComponentVariables() {
  const componentDir = path.join(ROOT_DIR, 'components');
  if (!fs.existsSync(componentDir)) {
    return;
  }

  const allowedPrefixes = ['--chips-sys-', '--chips-comp-', '--chips-layout-', '--chips-motion-'];

  for (const file of fs.readdirSync(componentDir).filter((name) => name.endsWith('.css'))) {
    const content = fs.readFileSync(path.join(componentDir, file), 'utf-8');
    const found = content.match(/--chips-[a-z0-9-]+/g) ?? [];
    const forbidden = [...new Set(found.filter((token) => !allowedPrefixes.some((prefix) => token.startsWith(prefix))))];
    if (forbidden.length > 0) {
      pushError('COMPONENT_VARIABLE_NAMESPACE_INVALID', `component stylesheet contains legacy/non-layer variable names: ${file}`, {
        forbidden,
      });
    }
  }
}

function validateAssets() {
  const requiredAssets = [
    'icons/icons.css',
    'animations/transitions.css',
    'animations/keyframes.css',
  ];
  for (const relativePath of requiredAssets) {
    if (!fs.existsSync(path.join(ROOT_DIR, relativePath))) {
      pushError('ASSET_MISSING', `required asset missing: ${relativePath}`);
    }
  }
}

function validateTests() {
  const requiredTests = [
    'animations.test.ts',
    'build.test.ts',
    'component-library-sync.test.ts',
    'components.test.ts',
    'coverage.test.ts',
    'dark-mode.test.ts',
    'icons.test.ts',
    'manifest.test.ts',
    'tokens.test.ts',
    'variables.test.ts',
  ];

  for (const file of requiredTests) {
    if (!fs.existsSync(path.join(ROOT_DIR, 'tests', file))) {
      pushError('TEST_FILE_MISSING', `missing required test file: tests/${file}`);
    }
  }
}

function validateDist() {
  const requiredDist = [
    'dist/theme.css',
    'dist/tokens/global.css',
    'dist/icons/icons.css',
    'dist/animations/transitions.css',
    'dist/animations/keyframes.css',
  ];

  for (const relativePath of requiredDist) {
    if (!fs.existsSync(path.join(ROOT_DIR, relativePath))) {
      pushError('DIST_OUTPUT_MISSING', `missing dist output: ${relativePath}`);
    }
  }

  const contract = readJson('contracts/theme-interface.contract.json', 'THEME_CONTRACT_PARSE_FAILED');
  if (!contract || !Array.isArray(contract.components)) {
    return;
  }

  const distComponentsDir = path.join(ROOT_DIR, 'dist', 'components');
  if (!fs.existsSync(distComponentsDir)) {
    pushError('DIST_OUTPUT_MISSING', 'missing dist/components directory');
    return;
  }

  const distFiles = fs.readdirSync(distComponentsDir).filter((file) => file.endsWith('.css')).sort();
  const expectedFiles = contract.components.map((component) => component.file).sort();
  const missing = expectedFiles.filter((file) => !distFiles.includes(file));
  const extra = distFiles.filter((file) => !expectedFiles.includes(file));
  if (missing.length > 0 || extra.length > 0) {
    pushError('DIST_COMPONENT_MISMATCH', 'dist/components must exactly match contract files', {
      missing,
      extra,
    });
  }
}

function validateArchive() {
  const legacyTokensDir = path.join(ROOT_DIR, 'archive', 'legacy-tokens');
  if (!fs.existsSync(legacyTokensDir)) {
    pushError('ARCHIVE_MISSING', 'archive/legacy-tokens directory is required for zero-compat migration records');
    return;
  }

  const jsonFiles = fs.readdirSync(legacyTokensDir).filter((file) => file.endsWith('.json'));
  if (jsonFiles.length === 0) {
    pushError('ARCHIVE_EMPTY', 'archive/legacy-tokens must keep migrated legacy token files');
  }
}

function main() {
  console.log(`Validating ${CONFIG.themeName}...`);

  validateManifest();
  validateContractAndComponents();
  validateTokens();
  validateComponentVariables();
  validateAssets();
  validateTests();
  validateDist();
  validateArchive();

  if (errors.length > 0) {
    console.error('Validation failed with standard errors:');
    for (const error of errors) {
      console.error(JSON.stringify(error));
    }
    process.exit(1);
  }

  console.log('Validation passed');
}

main();
