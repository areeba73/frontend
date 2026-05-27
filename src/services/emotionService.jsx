import axios from 'axios';

// Base URL for emotion detection API
const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const EMOTION_API = API_ROOT.endsWith('/emotion') ? API_ROOT : `${API_ROOT}/emotion`;
const LEGACY_EMOTION_API = API_ROOT.endsWith('/emotion') ? API_ROOT.replace(/\/emotion$/, '') : API_ROOT;

const withEmotionRouteFallback = async (request) => {
  try {
    return await request(EMOTION_API);
  } catch (error) {
    if (error.response?.status !== 404 || LEGACY_EMOTION_API === EMOTION_API) {
      throw error;
    }
    return request(LEGACY_EMOTION_API);
  }
};

/**
 * Emotion Detection Service for React/Vite
 */

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
};

// ============ FACE EMOTION ============
export const detectFaceEmotion = {
  // Upload image file
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/face/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Face emotion detection error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Base64 image (from canvas/camera)
  uploadBase64: async (base64Image) => {
    try {
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/face/base64`, {
        image: base64Image
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Face emotion detection error:', error);
      throw error.response?.data || error;
    }
  }
};

// ============ VOICE EMOTION ============
export const detectVoiceEmotion = {
  // Upload audio file
  uploadAudio: async (audioFile) => {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/voice/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Voice emotion detection error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Base64 audio
  uploadBase64: async (base64Audio, format = 'wav') => {
    try {
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/voice/base64`, {
        audio: base64Audio,
        format: format
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Voice emotion detection error:', error);
      throw error.response?.data || error;
    }
  }
};

// ============ TEXT EMOTION ============
export const detectTextEmotion = {
  // Single text
  detect: async (text) => {
    try {
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/text`, {
        text: text
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Text emotion detection error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Multiple texts at once
  detectBatch: async (texts) => {
    try {
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/text/batch`, {
        texts: texts
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Text emotion batch detection error:', error);
      throw error.response?.data || error;
    }
  }
};

// ============ COMBINED ============
export const detectCombinedEmotion = {
  // All 3 at once
  detect: async (imageFile, audioFile, text) => {
    try {
      const formData = new FormData();
      
      if (imageFile) formData.append('image', imageFile);
      if (audioFile) formData.append('audio', audioFile);
      if (text) formData.append('text', text);
      
      const response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/combined`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }));
      return response.data;
    } catch (error) {
      console.error('Combined emotion detection error:', error);
      throw error.response?.data || error;
    }
  }
};

// ============ MULTIMODAL SEVERITY ============
export const detectMultimodalSeverity = {
  analyze: async (results) => {
    try {
      const headers = {
        'Authorization': `Bearer ${getAuthToken()}`
      };
      const payload = { results };

      let response;
      try {
        response = await withEmotionRouteFallback((baseUrl) => axios.post(`${baseUrl}/severity/multimodal`, payload, { headers }));
      } catch (error) {
        if (error.response?.status !== 404) throw error;
        response = await axios.post(`${EMOTION_API}/emotion/severity/multimodal`, payload, { headers });
      }
      return response.data;
    } catch (error) {
      console.error('Multimodal severity error:', error);
      throw error.response?.data || error;
    }
  }
};

// ============ HISTORY ============
export const getEmotionHistory = {
  // Get emotion history
  fetch: async (days = 7, type = null) => {
    try {
      const token = getAuthToken();
      if (!token) return { history: [] };

      const response = await withEmotionRouteFallback((baseUrl) => axios.get(`${baseUrl}/history?days=${days}${type ? `&type=${type}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }));
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return { history: [] };
      }
      console.error('Emotion history fetch error:', error);
      throw error.response?.data || error;
    }
  }
};

// ============ HEALTH CHECK ============
export const checkEmotionModels = async () => {
  try {
    const response = await axios.get(`${EMOTION_API}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error.response?.data || error;
  }
};

export default {
  detectFaceEmotion,
  detectVoiceEmotion,
  detectTextEmotion,
  detectCombinedEmotion,
  detectMultimodalSeverity,
  getEmotionHistory,
  checkEmotionModels
};
