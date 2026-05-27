import { useDispatch, useSelector } from 'react-redux';
import {
  analyzeFaceEmotion,
  analyzeFaceEmotionBase64,
  analyzeVoiceEmotion,
  analyzeVoiceEmotionBase64,
  analyzeTextEmotion,
  analyzeCombinedEmotion,
  analyzeMultimodalSeverity,
  fetchEmotionHistory,
  setLatestAnalysis,
  clearError,
  clearCurrentAnalysis
} from '../store/slices/emotionSlice';

export const useEmotionDetection = () => {
  const dispatch = useDispatch();
  const emotionState = useSelector((state) => state.emotions);

  const analyzeFace = (imageFile) => dispatch(analyzeFaceEmotion(imageFile)).unwrap();
  const analyzeFaceBase64 = (base64Image) => dispatch(analyzeFaceEmotionBase64(base64Image)).unwrap();
  const analyzeVoice = (audioFile) => dispatch(analyzeVoiceEmotion(audioFile)).unwrap();
  const analyzeVoiceBase64 = (audio, format = 'wav') => dispatch(analyzeVoiceEmotionBase64({ audio, format })).unwrap();
  const analyzeText = (text) => dispatch(analyzeTextEmotion(text)).unwrap();
  const analyzeCombined = (payload) => dispatch(analyzeCombinedEmotion(payload)).unwrap();
  const analyzeSeverity = (results) => dispatch(analyzeMultimodalSeverity(results)).unwrap();
  const loadHistory = (params) => dispatch(fetchEmotionHistory(params)).unwrap();
  const saveLatestAnalysis = (result) => dispatch(setLatestAnalysis(result));

  return {
    ...emotionState,
    analyzeFace,
    analyzeFaceBase64,
    analyzeVoice,
    analyzeVoiceBase64,
    analyzeText,
    analyzeCombined,
    analyzeSeverity,
    loadHistory,
    saveLatestAnalysis,
    clearError: () => dispatch(clearError()),
    clearCurrentAnalysis: () => dispatch(clearCurrentAnalysis())
  };
};

export default useEmotionDetection;
