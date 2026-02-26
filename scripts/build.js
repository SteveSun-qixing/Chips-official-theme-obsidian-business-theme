import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CONTRACT_PATH = path.join(ROOT_DIR, 'contracts', 'theme-interface.contract.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyFilesByList(sourceDir, targetDir, files) {
  ensureDir(targetDir);
  files.forEach((file) => {
    const source = path.join(sourceDir, file);
    const target = path.join(targetDir, file);
    if (!fs.existsSync(source)) {
      throw new Error(`missing file: ${source}`);
    }
    copyFile(source, target);
  });
}

function copyDirectoryByExt(sourceDir, targetDir, extension) {
  if (!fs.existsSync(sourceDir)) {
    return 0;
  }
  ensureDir(targetDir);
  const files = fs.readdirSync(sourceDir).filter((name) => name.endsWith(extension));
  files.forEach((file) => {
    copyFile(path.join(sourceDir, file), path.join(targetDir, file));
  });
  return files.length;
}

function main() {
  console.log('Building Chips Obsidian Business Theme...\n');

  if (!fs.existsSync(CONTRACT_PATH)) {
    throw new Error('contracts/theme-interface.contract.json not found');
  }
  const contract = readJson(CONTRACT_PATH);
  const contractFiles = contract.components.map((component) => component.file);

  console.log('Step 1: Building tokens with Style Dictionary...');
  execSync('npm run build:tokens', { stdio: 'inherit' });
  console.log('✓ Tokens built successfully\n');

  console.log('Step 2: Syncing token entry and theme entry...');
  cleanDir(path.join(DIST_DIR, 'components'));
  cleanDir(path.join(DIST_DIR, 'icons'));
  cleanDir(path.join(DIST_DIR, 'animations'));
  copyFile(path.join(DIST_DIR, 'tokens', 'global.css'), path.join(ROOT_DIR, 'tokens', 'global.css'));
  copyFile(path.join(ROOT_DIR, 'theme.css'), path.join(DIST_DIR, 'theme.css'));
  console.log('✓ Synced tokens/global.css and theme.css\n');

  console.log('Step 3: Copying contract component styles...');
  copyFilesByList(path.join(ROOT_DIR, 'components'), path.join(DIST_DIR, 'components'), contractFiles);
  console.log(`✓ Copied ${contractFiles.length} contract component styles\n`);

  console.log('Step 4: Copying icon assets...');
  const iconCssCount = copyDirectoryByExt(path.join(ROOT_DIR, 'icons'), path.join(DIST_DIR, 'icons'), '.css');

  const svgSourceDir = path.join(ROOT_DIR, 'icons', 'svg');
  const svgTargetDir = path.join(DIST_DIR, 'icons', 'svg');
  let svgCount = 0;
  if (fs.existsSync(svgSourceDir)) {
    ensureDir(svgTargetDir);
    const files = fs.readdirSync(svgSourceDir).filter((name) => name.endsWith('.svg'));
    files.forEach((file) => {
      copyFile(path.join(svgSourceDir, file), path.join(svgTargetDir, file));
    });
    svgCount = files.length;
  }
  console.log(`✓ Copied ${iconCssCount} icon CSS files and ${svgCount} SVG files\n`);

  console.log('Step 5: Copying animation assets...');
  const animationCount = copyDirectoryByExt(path.join(ROOT_DIR, 'animations'), path.join(DIST_DIR, 'animations'), '.css');
  console.log(`✓ Copied ${animationCount} animation CSS files\n`);

  console.log('✓ Build complete!');
  console.log('Output directory: dist/');
}

try {
  main();
} catch (error) {
  console.error('✗ Build failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}
