import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const checker = path.join(repoRoot, 'scripts/check-styling-contract.mjs');

const createFixture = ({ componentSource, cssSource = '' }) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'styling-contract-'));
  const sourceDirectory = path.join(root, 'src/components');
  fs.mkdirSync(sourceDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(root, 'styling-contract.json'),
    JSON.stringify({ cssFiles: [], rawColorExceptions: [] })
  );
  fs.writeFileSync(path.join(sourceDirectory, 'Widget.jsx'), componentSource);
  fs.writeFileSync(path.join(sourceDirectory, 'Widget.css'), cssSource);
  return root;
};

const runChecker = (root) =>
  spawnSync(process.execPath, [checker, '--root', root], {
    encoding: 'utf8'
  });

test('rejects a CSS import that is not an approved escape hatch', () => {
  const root = createFixture({
    componentSource: "import './Widget.css';\nexport default function Widget() {}\n"
  });

  const result = runChecker(root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unapproved CSS file: src\/components\/Widget\.css/);
});

test('rejects a raw design color outside the token source', () => {
  const root = createFixture({
    componentSource: 'export default function Widget() {}\n',
    cssSource: '.widget { color: #904958; }\n'
  });

  const result = runChecker(root);

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /Raw color #904958 in src\/components\/Widget\.css/
  );
});
