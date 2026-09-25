export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://buyverse-django-rest-framework-backend.onrender.com'
).replace(/\/$/, '');

export const getMediaUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Array ba Object e chole asle prothom String ba image URL render korbe
  if (Array.isArray(imagePath) && imagePath.length > 0) {
    imagePath = imagePath[0]?.image || imagePath[0];
  }

  if (typeof imagePath === 'object' && imagePath?.image) {
    imagePath = imagePath.image;
  }

  if (typeof imagePath !== 'string') return '';

  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanPath}`;
};