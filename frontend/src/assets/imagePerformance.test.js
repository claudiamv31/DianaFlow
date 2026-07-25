import fs from 'fs';
import path from 'path';

const assetSize = (fileName) =>
  fs.statSync(path.join(__dirname, fileName)).size;

describe('initial image transfer budgets', () => {
  test('keeps the home background below 350 KB', () => {
    expect(assetSize('homepage-optimized.jpg')).toBeLessThanOrEqual(350 * 1024);
  });

  test('keeps the dark home background below 350 KB', () => {
    expect(assetSize('homepage-dark-optimized.jpg')).toBeLessThanOrEqual(
      350 * 1024
    );
  });

  test('keeps the default profile picture below 100 KB', () => {
    expect(assetSize('default-profile-pic-optimized.jpg')).toBeLessThanOrEqual(
      100 * 1024
    );
  });
});
