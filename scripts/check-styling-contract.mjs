import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const argumentsAfterScript = process.argv.slice(2);
const rootFlagIndex = argumentsAfterScript.indexOf('--root');
const frontendRoot = path.resolve(
  rootFlagIndex >= 0
    ? argumentsAfterScript[rootFlagIndex + 1]
    : path.join(scriptDirectory, '../frontend')
);
const sourceRoot = path.join(frontendRoot, 'src');
const contractPath = path.join(frontendRoot, 'styling-contract.json');
const supportedExtensions = new Set(['.css', '.js', '.jsx', '.ts', '.tsx']);

const toPosixPath = (value) => value.split(path.sep).join('/');
const relativePath = (value) =>
  toPosixPath(path.relative(frontendRoot, value));

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const approvedCssFiles = new Set(
  contract.cssFiles.map(({ path: approvedPath }) => approvedPath)
);
const rawColorExceptions = new Map(
  contract.rawColorExceptions.map((exception) => [
    exception.path,
    new Set(exception.values)
  ])
);
const sourceFiles = walk(sourceRoot).filter((filePath) =>
  supportedExtensions.has(path.extname(filePath))
);
const violations = [];

for (const filePath of sourceFiles) {
  const file = relativePath(filePath);
  const source = fs.readFileSync(filePath, 'utf8');

  if (path.extname(filePath) === '.css' && !approvedCssFiles.has(file)) {
    violations.push(`Unapproved CSS file: ${file}`);
  }

  const allowedValues = rawColorExceptions.get(file) || new Set();
  const rawColorPattern =
    /#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?)\(\s*(?!var\()[^)]+\)/g;

  for (const match of source.matchAll(rawColorPattern)) {
    const value = match[0];
    if (!allowedValues.has(value)) {
      violations.push(`Raw color ${value} in ${file}`);
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`${violations.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Styling contract valid: ${approvedCssFiles.size} approved CSS files.\n`
  );
}
