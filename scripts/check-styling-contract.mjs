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
const violations = [];
const approvedCssCategories = new Set([
  'foundation',
  'escape-hatch',
  'legacy'
]);
const foundationCssFiles = new Set([
  'src/styles/tokens.css',
  'src/styles/base.css'
]);
const legacyCssFiles = new Set([
  'src/components/FloatingCalendar.css',
  'src/components/Header/Header.css',
  'src/components/LogFlow/LogFlow.css',
  'src/components/Menu/Menu.css',
  'src/pages/CalendarPage/CalendarPage.css',
  'src/pages/CalendarPage/CalendarView/CalendarView.css',
  'src/pages/CalendarPage/LogPeriodCard/LogPeriodCard.css',
  'src/pages/Home/CircleContent/CircleContent.css',
  'src/pages/Home/CurrentCycleCard/CurrentCycleCard.css',
  'src/pages/Home/Home.css',
  'src/pages/Login/Login.css',
  'src/pages/SignUp/SignUp.css'
]);

for (const entry of contract.cssFiles) {
  if (!approvedCssCategories.has(entry.category)) {
    violations.push(
      `Invalid CSS category "${entry.category}" for ${entry.path}`
    );
  }

  if (typeof entry.reason !== 'string' || entry.reason.trim() === '') {
    violations.push(`Missing CSS reason: ${entry.path}`);
  }

  if (entry.category === 'foundation' && !foundationCssFiles.has(entry.path)) {
    violations.push(`Invalid foundation CSS path: ${entry.path}`);
  }

  if (entry.category === 'legacy' && !legacyCssFiles.has(entry.path)) {
    violations.push(`New legacy CSS entries are prohibited: ${entry.path}`);
  }
}

for (const entry of contract.rawColorExceptions) {
  if (typeof entry.reason !== 'string' || entry.reason.trim() === '') {
    violations.push(`Missing raw color exception reason: ${entry.path}`);
  }
}

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

  const rawTailwindColorPattern =
    /\b(?:bg|text|border|ring|divide|from|via|to|fill|stroke|shadow)-(?:black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-[0-9]{2,3})?(?:\/[0-9.]+)?\b/g;

  for (const match of source.matchAll(rawTailwindColorPattern)) {
    violations.push(`Raw Tailwind color ${match[0]} in ${file}`);
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
