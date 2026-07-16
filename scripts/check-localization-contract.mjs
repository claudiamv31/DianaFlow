import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');
const uniqueSorted = (values) => [...new Set(values)].sort();
const matches = (source, pattern) =>
  uniqueSorted([...source.matchAll(pattern)].map((match) => match[1]));

const assertSameContract = (name, backendValues, frontendValues) => {
  const missingInFrontend = backendValues.filter(
    (value) => !frontendValues.includes(value)
  );
  const missingInBackend = frontendValues.filter(
    (value) => !backendValues.includes(value)
  );

  if (missingInFrontend.length || missingInBackend.length) {
    throw new Error(
      `${name} mismatch\nMissing in frontend: ${missingInFrontend.join(', ') || 'none'}\n` +
        `Missing in backend: ${missingInBackend.join(', ') || 'none'}`
    );
  }
};

const backendGuidanceKeys = matches(
  read('backend/Modulos/Cycles/Services/GuidanceSelector.cs'),
  /"(guidance\.[^"]+)"/g
);
const frontendGuidanceKeys = matches(
  read('frontend/src/i18n/guidance.js'),
  /'(guidance\.[^']+)'/g
).filter((key) => !key.includes('${'));

const backendErrorCodes = matches(
  read('backend/Api/ApiError.cs'),
  /public const string \w+ = "([A-Z_]+)";/g
);
const frontendErrorCodes = matches(
  read('frontend/src/api/AppError.js'),
  /^\s*([A-Z][A-Z_]+):/gm
);
const backendFlowCodes = matches(
  read('backend/Modulos/Periods/Services/FlowIntensityCodes.cs'),
  /=> "([a-z_]+)"/g
);
const frontendFlowCodes = matches(
  read('frontend/src/i18n/domainCodes.js'),
  /'(light|medium|heavy)'/g
);
const backendRegularityCodes = matches(
  read('backend/Modulos/Cycles/Services/GuidanceSelector.cs'),
  /CycleRegularityLevel\.\w+ => "([a-z_]+)"/g
);
const frontendRegularityCodes = matches(
  read('frontend/src/i18n/domainCodes.js'),
  /'(unknown|regular|irregular|very_irregular)'/g
);

assertSameContract('Guidance key contract', backendGuidanceKeys, frontendGuidanceKeys);
assertSameContract('API error contract', backendErrorCodes, frontendErrorCodes);
assertSameContract('Flow code contract', backendFlowCodes, frontendFlowCodes);
assertSameContract(
  'Regularity code contract',
  backendRegularityCodes,
  frontendRegularityCodes
);

console.log(
  `Localization contracts valid: ${backendGuidanceKeys.length} guidance keys, ` +
    `${backendErrorCodes.length} API error codes, ` +
    `${backendFlowCodes.length + backendRegularityCodes.length} presentation codes.`
);
