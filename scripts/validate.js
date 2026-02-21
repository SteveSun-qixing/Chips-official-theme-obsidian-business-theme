import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Validating Chips Obsidian Business Theme...\n');

let hasErrors = false;
const contractPath = path.join(__dirname, '..', 'contracts', 'theme-interface.contract.json');
let themeContract = null;

if (!fs.existsSync(contractPath)) {
  console.error('✗ contracts/theme-interface.contract.json not found');
  hasErrors = true;
} else {
  try {
    themeContract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
  } catch (error) {
    console.error(`✗ failed to parse theme interface contract: ${error instanceof Error ? error.message : error}`);
    hasErrors = true;
  }
}

// 1. 验证 manifest.yaml
console.log('1. Checking manifest.yaml...');
const manifestPath = path.join(__dirname, '..', 'manifest.yaml');
if (!fs.existsSync(manifestPath)) {
  console.error('✗ manifest.yaml not found');
  hasErrors = true;
} else {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const requiredSnippets = [
    'schemaVersion: "1.0.0"',
    'id: "chips-official.obsidian-business-theme"',
    'type: "theme"',
    'tokens: "tokens/global.css"',
    'themeCss: "theme.css"',
    'tokensVersion: "1.0.0"',
    'darkMode: true',
    'inherits: "chips-official.default-theme"',
    'compatibility:',
    'host: ">=1.0.0"'
  ];

  requiredSnippets.forEach((snippet) => {
    if (!manifestContent.includes(snippet)) {
      console.error(`✗ manifest missing required snippet: ${snippet}`);
      hasErrors = true;
    }
  });

  if (manifestContent.includes('dist/')) {
    console.error('✗ manifest contains disallowed dist/ prefixed entry path');
    hasErrors = true;
  }

  console.log('✓ manifest.yaml contract checks completed');
}

// 2. 验证 Token 文件
console.log('\n2. Checking token files...');
const requiredTokens = [
  'color.json',
  'typography.json',
  'spacing.json',
  'radius.json',
  'shadow.json',
  'motion.json',
  'z-index.json',
  'breakpoint.json'
];

const tokensDir = path.join(__dirname, '..', 'tokens');
requiredTokens.forEach(token => {
  const tokenPath = path.join(tokensDir, token);
  if (!fs.existsSync(tokenPath)) {
    console.error(`✗ Missing token file: ${token}`);
    hasErrors = true;
  } else {
    console.log(`✓ ${token}`);
  }
});

// 3. 验证组件样式文件
console.log('\n3. Checking component styles...');
const requiredComponents = Array.isArray(themeContract?.components)
  ? themeContract.components.map((component) => component.file)
  : [];

const componentsDir = path.join(__dirname, '..', 'components');
requiredComponents.forEach(component => {
  const componentPath = path.join(componentsDir, component);
  if (!fs.existsSync(componentPath)) {
    console.error(`✗ Missing component style: ${component}`);
    hasErrors = true;
  } else {
    console.log(`✓ ${component}`);
  }
});

// 4. 验证图标文件
console.log('\n4. Checking icon files...');
const iconsPath = path.join(__dirname, '..', 'icons', 'icons.css');
if (!fs.existsSync(iconsPath)) {
  console.error('✗ icons/icons.css not found');
  hasErrors = true;
} else {
  console.log('✓ icons/icons.css');
}

// 5. 验证动画文件
console.log('\n5. Checking animation files...');
const requiredAnimations = ['transitions.css', 'keyframes.css'];
const animationsDir = path.join(__dirname, '..', 'animations');
requiredAnimations.forEach(animation => {
  const animationPath = path.join(animationsDir, animation);
  if (!fs.existsSync(animationPath)) {
    console.error(`✗ Missing animation file: ${animation}`);
    hasErrors = true;
  } else {
    console.log(`✓ ${animation}`);
  }
});

// 6. 验证测试文件
console.log('\n6. Checking test files...');
const requiredTests = [
  'tokens.test.ts', 'components.test.ts', 'build.test.ts',
  'variables.test.ts', 'dark-mode.test.ts', 'icons.test.ts',
  'animations.test.ts', 'coverage.test.ts', 'component-library-sync.test.ts'
];

const testsDir = path.join(__dirname, '..', 'tests');
requiredTests.forEach(test => {
  const testPath = path.join(testsDir, test);
  if (!fs.existsSync(testPath)) {
    console.error(`✗ Missing test file: ${test}`);
    hasErrors = true;
  } else {
    console.log(`✓ ${test}`);
  }
});

// 7. 验证主题入口与接口合同
console.log('\n7. Checking theme entry and interface contract...');
const themeCssPath = path.join(__dirname, '..', 'theme.css');
if (!fs.existsSync(themeCssPath)) {
  console.error('✗ theme.css not found');
  hasErrors = true;
} else {
  console.log('✓ theme.css');
}

if (themeContract) {
  console.log('✓ contracts/theme-interface.contract.json');
}

const tokenEntryPath = path.join(__dirname, '..', 'tokens', 'global.css');
if (!fs.existsSync(tokenEntryPath)) {
  console.error('✗ tokens/global.css not found (run pnpm build first to sync token entry)');
  hasErrors = true;
} else {
  console.log('✓ tokens/global.css');
}

// 总结
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n✗ Validation failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('\n✓ All validation checks passed!');
}
