export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://buyverse-django-rest-framework-backend.onrender.com'
).replace(/\/$/, '');

export const getMediaUrl = (imagePath) => {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${API_BASE_URL}/${String(imagePath).replace(/^\/+/, '')}`;
};