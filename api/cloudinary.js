import crypto from 'crypto';

const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const generateSignature = (timestamp) => {
  if (!CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary API secret is not configured');
  }

  const paramsToSign = {
    timestamp,
    upload_preset: 'ml_default',
    folder: 'vedgarden'
  };

  // Sort parameters alphabetically
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .reduce((acc, key) => {
      acc[key] = paramsToSign[key];
      return acc;
    }, {});

  // Create string to sign
  const stringToSign = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Generate signature
  const signature = crypto
    .createHash('sha1')
    .update(stringToSign + CLOUDINARY_API_SECRET)
    .digest('hex');

  return signature;
}; 