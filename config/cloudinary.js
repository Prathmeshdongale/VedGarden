// Cloudinary configuration for client-side uploads
const cloudName = 'ddgzlt0bz';
const apiKey = '837595933866829';
const apiSecret = 'p6S5M0M6NjmPNG722gK3WwpGFzU';
const uploadPreset = 'vedgarden';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', apiKey);
    formData.append('timestamp', Math.floor(Date.now() / 1000));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 