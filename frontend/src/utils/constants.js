export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
export const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dnucxmp2s';
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'ChatApp';

export const MESSAGE_TYPES = {
  TEXT: 'text', IMAGE: 'image', VIDEO: 'video', AUDIO: 'audio',
  VOICE: 'voice', DOCUMENT: 'document', CONTACT: 'contact',
  LOCATION: 'location', STICKER: 'sticker', GIF: 'gif', SYSTEM: 'system'
};

export const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
