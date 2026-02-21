import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsToCreate = [
  { name: 'button', className: 'chips-button', scope: 'button', parts: ['root'] },
  { name: 'input', className: 'chips-input', scope: 'input', parts: ['root', 'control'] },
  { name: 'textarea', className: 'chips-textarea', scope: 'textarea', parts: ['root', 'control'] },
  { name: 'checkbox', className: 'chips-checkbox', scope: 'checkbox', parts: ['root', 'control'] },
  { name: 'switch', className: 'chips-switch', scope: 'switch', parts: ['root', 'control'] },
  { name: 'select', className: 'chips-select', scope: 'select', parts: ['root', 'trigger', 'content', 'item'] },
  { name: 'dialog', className: 'chips-dialog', scope: 'dialog', parts: ['backdrop', 'content', 'title', 'close'] },
  { name: 'tabs', className: 'chips-tabs', scope: 'tabs', parts: ['root', 'list', 'trigger', 'content'] },
  { name: 'form', className: 'chips-form', scope: 'form', parts: ['root'] },
  { name: 'file-upload', className: 'chips-file-upload', scope: 'file-upload', parts: ['root', 'dropzone', 'meta'] },
  { name: 'image-viewer-shell', className: 'chips-image-viewer-shell', scope: 'image-viewer-shell', parts: ['overlay', 'stage', 'image', 'close'] },
  { name: 'menu', className: 'chips-menu', scope: 'menu', parts: ['content', 'item', 'item-text'] },
  { name: 'radio-group', className: 'chips-radio-group', scope: 'radio-group', parts: ['root', 'item', 'control', 'indicator'] },
];

const componentsDir = path.join(__dirname, '..', 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

componentsToCreate.forEach(({ name, className, scope, parts }) => {
  const filePath = path.join(componentsDir, `${name}.css`);

  if (fs.existsSync(filePath)) {
    console.log(`Skipped (already exists): ${name}.css`);
    return;
  }

  const rootPart = parts.includes('root') ? 'root' : parts[0];
  const scopedRootSelector = `[data-scope="${scope}"][data-part="${rootPart}"]`;
  const partSelectors = parts
    .filter((part) => part !== rootPart)
    .map((part) => `[data-scope="${scope}"] [data-part="${part}"]`)
    .join(',\n');

  const content = `${`.${className},\n${scopedRootSelector}`} {
  border: 1px solid var(--chips-color-border);
  border-radius: var(--chips-radius-md);
  background: var(--chips-color-surface);
  color: var(--chips-color-text);
  font-family: var(--chips-font-family-base);
  transition: all var(--chips-motion-duration-fast) var(--chips-motion-easing-default);
}

${partSelectors ? `${partSelectors} {\n  color: var(--chips-color-text);\n}\n\n` : ''}${scopedRootSelector}:focus-visible {
  outline: 2px solid var(--chips-color-focus-ring, var(--chips-color-primary));
  outline-offset: 2px;
}
`;

  fs.writeFileSync(filePath, content);
  console.log(`Created: ${name}.css`);
});

console.log('\nComponent styles generation complete!');
