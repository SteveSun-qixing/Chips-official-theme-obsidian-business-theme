import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building Chips Obsidian Business Theme...\n');

// 1. 构建 Tokens
console.log('Step 1: Building tokens with Style Dictionary...');
try {
  execSync('npm run build:tokens', { stdio: 'inherit' });
  console.log('✓ Tokens built successfully\n');
} catch (error) {
  console.error('✗ Failed to build tokens');
  process.exit(1);
}

// 2. 同步 manifest 入口 tokens/global.css
console.log('Step 2: Syncing manifest token entry...');
const distTokenCss = path.join(__dirname, '..', 'dist', 'tokens', 'global.css');
const rootTokenCss = path.join(__dirname, '..', 'tokens', 'global.css');
if (!fs.existsSync(path.dirname(rootTokenCss))) {
  fs.mkdirSync(path.dirname(rootTokenCss), { recursive: true });
}
fs.copyFileSync(distTokenCss, rootTokenCss);
console.log('✓ Synced tokens/global.css\n');

// 3. 复制主题入口
console.log('Step 3: Copying theme entry CSS...');
const themeCssSrc = path.join(__dirname, '..', 'theme.css');
const distThemeCss = path.join(__dirname, '..', 'dist', 'theme.css');
if (!fs.existsSync(path.dirname(distThemeCss))) {
  fs.mkdirSync(path.dirname(distThemeCss), { recursive: true });
}
fs.copyFileSync(themeCssSrc, distThemeCss);
console.log('✓ Copied theme.css\n');

// 4. 复制组件样式
console.log('Step 4: Copying component styles...');
const componentsDir = path.join(__dirname, '..', 'components');
const distComponentsDir = path.join(__dirname, '..', 'dist', 'components');

if (!fs.existsSync(distComponentsDir)) {
  fs.mkdirSync(distComponentsDir, { recursive: true });
}

const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.css'));
componentFiles.forEach(file => {
  fs.copyFileSync(
    path.join(componentsDir, file),
    path.join(distComponentsDir, file)
  );
});
console.log(`✓ Copied ${componentFiles.length} component styles\n`);

// 5. 复制图标
console.log('Step 5: Copying icons...');
const iconsDir = path.join(__dirname, '..', 'icons');
const distIconsDir = path.join(__dirname, '..', 'dist', 'icons');

if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.css'));
iconFiles.forEach(file => {
  fs.copyFileSync(
    path.join(iconsDir, file),
    path.join(distIconsDir, file)
  );
});

// 复制 SVG 图标（如果存在）
const svgDir = path.join(iconsDir, 'svg');
const distSvgDir = path.join(distIconsDir, 'svg');
if (fs.existsSync(svgDir)) {
  if (!fs.existsSync(distSvgDir)) {
    fs.mkdirSync(distSvgDir, { recursive: true });
  }
  const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
  svgFiles.forEach(file => {
    fs.copyFileSync(
      path.join(svgDir, file),
      path.join(distSvgDir, file)
    );
  });
  console.log(`✓ Copied ${iconFiles.length} icon CSS files and ${svgFiles.length} SVG files\n`);
} else {
  console.log(`✓ Copied ${iconFiles.length} icon CSS files\n`);
}

// 6. 复制动画
console.log('Step 6: Copying animations...');
const animationsDir = path.join(__dirname, '..', 'animations');
const distAnimationsDir = path.join(__dirname, '..', 'dist', 'animations');

if (!fs.existsSync(distAnimationsDir)) {
  fs.mkdirSync(distAnimationsDir, { recursive: true });
}

const animationFiles = fs.readdirSync(animationsDir).filter(f => f.endsWith('.css'));
animationFiles.forEach(file => {
  fs.copyFileSync(
    path.join(animationsDir, file),
    path.join(distAnimationsDir, file)
  );
});
console.log(`✓ Copied ${animationFiles.length} animation files\n`);

console.log('✓ Build complete!');
console.log('\nOutput directory: dist/');
