const MAX_AVATAR_DIMENSION = 512;
const AVATAR_JPEG_QUALITY = 0.82;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid avatar image'));
    };
    image.src = objectUrl;
  });

export const optimizeAvatarImage = async (file) => {
  const image = await loadImage(file);
  const scale = Math.min(
    1,
    MAX_AVATAR_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  const surfaceColor = getComputedStyle(document.body).backgroundColor;
  if (surfaceColor) {
    context.fillStyle = surfaceColor;
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('Avatar conversion failed')),
      'image/jpeg',
      AVATAR_JPEG_QUALITY
    );
  });
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'avatar';

  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: file.lastModified
  });
};
