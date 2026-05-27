import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  detectFaceEmotion,
  detectVoiceEmotion,
  detectTextEmotion,
  detectCombinedEmotion,
  detectMultimodalSeverity,
  getEmotionHistory
} from '../../services/emotionService';

const getErrorMessage = (error, fallback = 'An error occurred') => {
  if (typeof error === 'string') return error;
  if (error?.error && typeof error.error === 'string') return error.error;
  if (error?.message) return error.message;
  return fallback;
};

export const analyzeFaceEmotion = createAsyncThunk(
  'emotions/analyzeFace',
  async (imageFile, { rejectWithValue }) => {
    try {
      return await detectFaceEmotion.uploadImage(imageFile);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Face emotion detection failed'));
    }
  }
);

export const analyzeFaceEmotionBase64 = createAsyncThunk(
  'emotions/analyzeFaceBase64',
  async (base64Image, { rejectWithValue }) => {
    try {
      return await detectFaceEmotion.uploadBase64(base64Image);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Face emotion detection failed'));
    }
  }
);

export const analyzeVoiceEmotion = createAsyncThunk(
  'emotions/analyzeVoice',
  async (audioFile, { rejectWithValue }) => {
    try {
      return await detectVoiceEmotion.uploadAudio(audioFile);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Voice emotion detection failed'));
    }
  }
);

export const analyzeVoiceEmotionBase64 = createAsyncThunk(
  'emotions/analyzeVoiceBase64',
  async ({ audio, format = 'wav' }, { rejectWithValue }) => {
    try {
      return await detectVoiceEmotion.uploadBase64(audio, format);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Voice emotion detection failed'));
    }
  }
);

export const analyzeTextEmotion = createAsyncThunk(
  'emotions/analyzeText',
  async (text, { rejectWithValue }) => {
    try {
      return await detectTextEmotion.detect(text);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Text emotion detection failed'));
    }
  }
);

export const analyzeCombinedEmotion = createAsyncThunk(
  'emotions/analyzeCombined',
  async ({ imageFile, audioFile, text }, { rejectWithValue }) => {
    try {
      return await detectCombinedEmotion.detect(imageFile, audioFile, text);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Combined emotion detection failed'));
    }
  }
);

export const analyzeMultimodalSeverity = createAsyncThunk(
  'emotions/analyzeMultimodalSeverity',
  async (results, { rejectWithValue }) => {
    try {
      return await detectMultimodalSeverity.analyze(results);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Severity analysis failed'));
    }
  }
);

export const fetchEmotionHistory = createAsyncThunk(
  'emotions/fetchHistory',
  async ({ days = 7, type = null }, { rejectWithValue }) => {
    try {
      return await getEmotionHistory.fetch(days, type);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Emotion history fetch failed'));
    }
  }
);

const setLatest = (state, action, type) => {
  state.currentAnalysis[type] = action.payload;
  state.latestAnalysis = action.payload;
  state.lastAnalysisTime = new Date().toISOString();
  if (action.payload?.emotion) {
    state.currentMood = action.payload.emotion;
  }
};

const emotionSlice = createSlice({
  name: 'emotions',
  initialState: {
    currentMood: null,
    currentAnalysis: {
      face: null,
      voice: null,
      text: null
    },
    latestAnalysis: null,
    history: [],
    loading: false,
    error: null,
    lastAnalysisTime: null
  },
  reducers: {
    setMood: (state, action) => {
      state.currentMood = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    setLatestAnalysis: (state, action) => {
      state.latestAnalysis = action.payload;
      state.lastAnalysisTime = new Date().toISOString();
      if (action.payload?.emotion) {
        state.currentMood = action.payload.emotion;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = {
        face: null,
        voice: null,
        text: null
      };
      state.latestAnalysis = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeFaceEmotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeFaceEmotion.fulfilled, (state, action) => {
        state.loading = false;
        setLatest(state, action, 'face');
      })
      .addCase(analyzeFaceEmotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(analyzeFaceEmotionBase64.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeFaceEmotionBase64.fulfilled, (state, action) => {
        state.loading = false;
        setLatest(state, action, 'face');
      })
      .addCase(analyzeFaceEmotionBase64.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(analyzeVoiceEmotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeVoiceEmotion.fulfilled, (state, action) => {
        state.loading = false;
        setLatest(state, action, 'voice');
      })
      .addCase(analyzeVoiceEmotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(analyzeVoiceEmotionBase64.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeVoiceEmotionBase64.fulfilled, (state, action) => {
        state.loading = false;
        setLatest(state, action, 'voice');
      })
      .addCase(analyzeVoiceEmotionBase64.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(analyzeTextEmotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeTextEmotion.fulfilled, (state, action) => {
        state.loading = false;
        setLatest(state, action, 'text');
      })
      .addCase(analyzeTextEmotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(analyzeCombinedEmotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeCombinedEmotion.fulfilled, (state, action) => {
        state.loading = false;
        const results = action.payload.results || {};
        if (results.face) state.currentAnalysis.face = results.face;
        if (results.voice) state.currentAnalysis.voice = results.voice;
        if (results.text) state.currentAnalysis.text = results.text;
        state.latestAnalysis = results.face || results.voice || results.text || action.payload;
        state.lastAnalysisTime = new Date().toISOString();
      })
      .addCase(analyzeCombinedEmotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(analyzeMultimodalSeverity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeMultimodalSeverity.fulfilled, (state, action) => {
        state.loading = false;
        state.latestAnalysis = action.payload;
        state.lastAnalysisTime = new Date().toISOString();
      })
      .addCase(analyzeMultimodalSeverity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmotionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmotionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.history || [];
        if (!state.latestAnalysis) {
          state.latestAnalysis = state.history[0] || null;
        }
      })
      .addCase(fetchEmotionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setMood, setHistory, setLatestAnalysis, clearError, clearCurrentAnalysis } = emotionSlice.actions;
export default emotionSlice.reducer;
