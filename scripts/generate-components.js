import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsToCreate = [
  { name: 'checkbox', className: 'chips-checkbox' },
  { name: 'switch', className: 'chips-switch' },
  { name: 'radio', className: 'chips-radio' },
  { name: 'select', className: 'chips-select' },
  { name: 'dialog', className: 'chips-dialog' },
  { name: 'tabs', className: 'chips-tabs' },
  { name: 'dropdown', className: 'chips-dropdown' },
  { name: 'tooltip', className: 'chips-tooltip' },
  { name: 'slider', className: 'chips-slider' },
  { name: 'accordion', className: 'chips-accordion' },
  { name: 'toast', className: 'chips-toast' },
  { name: 'card-wrapper', className: 'chips-card-wrapper' },
  { name: 'card-loading', className: 'chips-card-loading' },
  { name: 'card-error', className: 'chips-card-error' },
  { name: 'iframe-host', className: 'chips-iframe-host' },
  { name: 'cover-frame', className: 'chips-cover-frame' },
  { name: 'dock', className: 'chips-dock' },
  { name: 'tool-window', className: 'chips-tool-window' },
  { name: 'file-tree', className: 'chips-file-tree' },
  { name: 'tag-input', className: 'chips-tag-input' },
  { name: 'zoom-slider', className: 'chips-zoom-slider' }
];

const componentsDir = path.join(__dirname, '..', 'components');

// 确保目录存在
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

componentsToCreate.forEach(({ name, className }) => {
  const filePath = path.join(componentsDir, `${name}.css`);

  // 如果文件已存在，跳过
  if (fs.existsSync(filePath)) {
    console.log(`Skipped (already exists): ${name}.css`);
    return;
  }

  const content = `.${className} {
  background: var(--chips-color-surface);
  color: var(--chips-color-text);
  border: 1px solid var(--chips-color-border);
  border-radius: var(--chips-radius-md);
  font-family: var(--chips-font-family-base);
  font-size: var(--chips-font-size-md);
  transition: all var(--chips-motion-duration-fast) var(--chips-motion-easing-default);
}

.${className}:hover {
  border-color: var(--chips-color-primary);
}

.${className}:focus-visible {
  outline: 2px solid var(--chips-color-primary);
  outline-offset: 2px;
}

.${className}--disabled,
.${className}[aria-disabled="true"],
.${className}:disabled {
  opacity: 0.6;
  pointer-events: none;
}
`;

  fs.writeFileSync(filePath, content);
  console.log(`Created: ${name}.css`);
});

console.log('\nComponent styles generation complete!');
