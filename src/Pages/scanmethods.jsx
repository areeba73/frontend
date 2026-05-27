import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import bg from "../assets/bg.jpeg";
import Face from "../assets/face.png";
import MicScan from "../assets/mic.jpeg";
import TextScan from "../assets/text.jpeg";
import { useEmotionDetection } from '../hooks/useEmotionDetection';

const floatTo16BitPCM = (view, offset, input) => {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWav = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
};

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const emotionWeights = {
  angry: 0.9,
  anger: 0.9,
  fear: 0.95,
  fearful: 0.95,
  sad: 0.82,
  sadness: 0.82,
  disgust: 0.78,
  disgusted: 0.78,
  surprise: 0.42,
  neutral: 0.24,
  happy: 0.08,
  joy: 0.08
};

const fusionWeights = {
  face: 0.3,
  voice: 0.35,
  text: 0.35
};

const sigmoid = (value) => 1 / (1 + Math.exp(-value));

const estimateSeverity = (emotion, confidence, allEmotions) => {
  const dominantWeight = emotionWeights[emotion] ?? 0.35;
  const confidenceSignal = Math.min(Math.max(Number(confidence) || 0, 0), 1);
  const entries = Object.entries(allEmotions || {});
  const total = entries.reduce((sum, [, probability]) => sum + (Number(probability) || 0), 0);
  const weightedRisk = total > 0
    ? entries.reduce((sum, [label, probability]) => (
      sum + (Number(probability) || 0) * (emotionWeights[label] ?? 0.35)
    ), 0) / total
    : dominantWeight;
  const uncertainty = 1 - confidenceSignal;
  const rawScore = (2.35 * weightedRisk) + (1.15 * dominantWeight * confidenceSignal) - (0.65 * uncertainty) + 0.08 - 1.45;
  const score = Math.round(sigmoid(rawScore) * 100);

  return {
    level: score >= 67 ? 'High' : score >= 38 ? 'Medium' : 'Low',
    score,
    method: 'multimodal_emotion_fusion',
    sources: ['face', 'voice', 'text']
  };
};

const buildMultimodalSeverity = (results) => {
  const fusedEmotions = {};

  Object.entries(fusionWeights).forEach(([source, sourceWeight]) => {
    const result = results[source];
    const allEmotions = result?.all_emotions || { [result?.emotion]: result?.confidence };

    Object.entries(allEmotions || {}).forEach(([emotion, probability]) => {
      const key = (emotion || '').toLowerCase();
      fusedEmotions[key] = (fusedEmotions[key] || 0) + (Number(probability) || 0) * sourceWeight;
    });
  });

  const total = Object.values(fusedEmotions).reduce((sum, probability) => sum + probability, 0);
  const normalized = Object.fromEntries(
    Object.entries(fusedEmotions).map(([emotion, probability]) => [
      emotion,
      total > 0 ? Number((probability / total).toFixed(4)) : 0
    ])
  );
  const dominantEmotion = Object.entries(normalized)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  const confidence = normalized[dominantEmotion] || 0;
  const severity = estimateSeverity(dominantEmotion, confidence, normalized);

  return {
    type: 'multimodal',
    emotion: dominantEmotion,
    confidence,
    all_emotions: normalized,
    severity,
    suggestion: severity.level === 'High'
      ? 'Your combined face, voice, and text signals show high stress. Consider talking to the chatbot or finding a doctor.'
      : severity.level === 'Medium'
        ? 'Your combined signals show moderate stress. Take a pause, breathe slowly, and check in again later.'
        : 'Your combined signals look stable. Keep tracking your mood and notice what supports you.',
    source_results: results,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10)
  };
};

const ScanMethods = () => {
  const navigate = useNavigate();
  const {
    analyzeFaceBase64,
    analyzeVoiceBase64,
    analyzeText,
    analyzeSeverity,
    saveLatestAnalysis,
    loading,
    error,
    currentAnalysis
  } = useEmotionDetection();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [text, setText] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const methods = [
    {
      title: 'Face Emotion',
      btn: cameraOpen ? 'Capture & Analyze' : 'Scan Face',
      img: Face,
      isImage: true,
      id: 'face'
    },
    {
      title: 'Voice Emotion',
      btn: isRecording ? 'Recording...' : 'Record Voice',
      img: MicScan,
      isImage: true,
      id: 'voice'
    },
    {
      title: 'Text Emotion',
      btn: 'Analyze Text',
      img: TextScan,
      isImage: true,
      id: 'text'
    }
  ];

  const completedSources = ['face', 'voice', 'text'].filter((source) => currentAnalysis?.[source]?.emotion);
  const canCheckSeverity = completedSources.length === 3;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const startCamera = async () => {
    try {
      setSelectedMethod('face');
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied or unavailable.');
    }
  };

  const captureFace = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is still starting. Try again in a second.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const result = await analyzeFaceBase64(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
    if (result?.emotion) navigate('/result');
  };

  const recordVoice = async () => {
    let micStream;
    let audioContext;
    let source;
    let processor;

    try {
      setSelectedMethod('voice');
      setVoiceStatus('Listening for 4 seconds...');
      setIsRecording(true);

      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      source = audioContext.createMediaStreamSource(micStream);
      processor = audioContext.createScriptProcessor(4096, 1, 1);
      const chunks = [];

      processor.onaudioprocess = (event) => {
        chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      await new Promise((resolve) => setTimeout(resolve, 4000));

      processor.disconnect();
      source.disconnect();
      micStream.getTracks().forEach((track) => track.stop());

      const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
      const samples = new Float32Array(length);
      let offset = 0;
      chunks.forEach((chunk) => {
        samples.set(chunk, offset);
        offset += chunk.length;
      });

      setVoiceStatus('Analyzing voice...');
      const wavBlob = encodeWav(samples, audioContext.sampleRate);
      const dataUrl = await blobToDataUrl(wavBlob);
      const result = await analyzeVoiceBase64(dataUrl, 'wav');
      setVoiceStatus('');
      if (result?.emotion) navigate('/result');
    } catch (err) {
      console.error('Voice recording error:', err);
      setVoiceStatus('Microphone access denied or voice analysis failed.');
    } finally {
      setIsRecording(false);
      if (processor) processor.disconnect();
      if (source) source.disconnect();
      if (micStream) micStream.getTracks().forEach((track) => track.stop());
      if (audioContext) audioContext.close();
    }
  };

  const analyzeTypedText = async () => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const result = await analyzeText(cleanText);
    setText('');
    if (result?.emotion) navigate('/result');
  };

  const handleAnalyze = async (methodId) => {
    try {
      setActiveMethod(methodId);
      if (methodId === 'face') {
        if (cameraOpen) await captureFace();
        else await startCamera();
      } else if (methodId === 'voice') {
        await recordVoice();
      } else if (methodId === 'text') {
        if (selectedMethod !== 'text') {
          setSelectedMethod('text');
          return;
        }
        await analyzeTypedText();
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setActiveMethod(null);
    }
  };

  const handleCheckSeverity = async () => {
    if (!canCheckSeverity) return;

    try {
      const results = {
        face: currentAnalysis.face,
        voice: currentAnalysis.voice,
        text: currentAnalysis.text
      };
      let result;
      try {
        result = await analyzeSeverity(results);
      } catch (err) {
        console.error('Saved severity analysis failed, using local result:', err);
        result = buildMultimodalSeverity(results);
      }
      saveLatestAnalysis(result);
      if (result?.severity) navigate('/result');
    } catch (err) {
      console.error('Severity analysis error:', err);
    }
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.error('Video play error:', err);
        setCameraError('Unable to start camera preview.');
      });
    }
  }, [cameraOpen]);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-fixed bg-center relative overflow-x-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Navbar />

      <main className="relative z-10 pt-48 pb-20">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#2F357D] mb-4 tracking-tight">
              Emotion Scan
            </h2>
            <p className="text-[#718096] text-lg font-medium max-w-2xl">
              Choose a live method to analyze your current emotion.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {typeof error === 'string' ? error : error?.error || 'An error occurred'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {methods.map((item) => (
              <div key={item.id}>
                <div
                  className="bg-white/60 backdrop-blur-2xl border border-white p-8 rounded-[40px] shadow-xl flex flex-col items-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => setSelectedMethod(selectedMethod === item.id ? null : item.id)}
                >
                  <h3 className="text-[#2F357D] text-xl font-semibold mb-8">{item.title}</h3>

                  <div className="w-full h-[220px] bg-white/40 rounded-[35px] mb-8 border border-white/50 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {item.id === 'face' && cameraOpen ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover bg-black scale-x-[-1]"
                      />
                    ) : item.isImage ? (
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-[#2F357D] tracking-widest">{item.icon}</span>
                        <div className="mt-5 w-14 h-1.5 bg-[#5390F5]/20 rounded-full"></div>
                      </div>
                    )}
                    <div className="absolute inset-3 border border-white/30 rounded-[28px] pointer-events-none"></div>
                  </div>

                  {selectedMethod === item.id && (
                    <div
                      className="w-full mb-4 p-3 bg-white/50 rounded-lg"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {item.id === 'text' && (
                        <textarea
                          value={text}
                          onChange={(event) => setText(event.target.value)}
                          placeholder="Write how you are feeling..."
                          className="w-full p-3 border rounded-lg text-sm"
                          rows="4"
                        />
                      )}

                      {item.id === 'face' && (
                        <div className="space-y-3">
                          <p className="text-sm text-[#2F357D] font-medium">
                            {cameraOpen ? 'Look at the camera, then capture.' : 'Click Scan Face to open camera.'}
                          </p>
                          {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
                          {cameraOpen && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                stopCamera();
                              }}
                              className="w-full py-2 px-4 rounded-lg bg-white text-[#2F357D] font-semibold border border-[#2F357D]/20"
                            >
                              Close Camera
                            </button>
                          )}
                        </div>
                      )}

                      {item.id === 'voice' && (
                        <p className="text-sm text-[#2F357D] font-medium">
                          {voiceStatus || 'Click Record Voice and speak naturally for 4 seconds.'}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAnalyze(item.id);
                    }}
                    disabled={(loading && activeMethod === item.id) || (isRecording && item.id !== 'voice')}
                    className="w-full py-4.5 px-6 rounded-2xl bg-[#2F357D] hover:bg-[#3b7ae0] disabled:opacity-50 text-white font-semibold text-lg shadow-[0_10px_25px_rgba(83,144,245,0.4)] transition-all transform active:scale-95"
                  >
                    {loading && activeMethod === item.id ? 'Analyzing...' : item.btn}
                  </button>
                </div>

                {item.id === 'face' && currentAnalysis?.face && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <p className="font-semibold text-green-800">
                      {currentAnalysis.face.emotion} ({Math.round(currentAnalysis.face.confidence * 100)}%)
                    </p>
                  </div>
                )}
                {item.id === 'voice' && currentAnalysis?.voice && (
                  <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                    <p className="font-semibold text-blue-800">
                      {currentAnalysis.voice.emotion} ({Math.round(currentAnalysis.voice.confidence * 100)}%)
                    </p>
                  </div>
                )}
                {item.id === 'text' && currentAnalysis?.text && (
                  <div className="mt-4 p-4 bg-purple-100 rounded-lg">
                    <p className="font-semibold text-purple-800">
                      {currentAnalysis.text.emotion} ({Math.round(currentAnalysis.text.confidence * 100)}%)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white/70 backdrop-blur-2xl border border-white rounded-[32px] shadow-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-[#2F357D] text-2xl font-bold mb-2">Overall Severity Check</h3>
              <p className="text-[#718096] font-medium">
                Complete face, voice, and text scans to estimate stress severity from all three models.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['face', 'voice', 'text'].map((source) => (
                  <span
                    key={source}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                      currentAnalysis?.[source]?.emotion
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white/70 text-[#718096]'
                    }`}
                  >
                    {source}: {currentAnalysis?.[source]?.emotion ? 'Done' : 'Pending'}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckSeverity}
              disabled={!canCheckSeverity || loading}
              className="shrink-0 py-4 px-8 rounded-2xl bg-[#2F357D] hover:bg-[#3b7ae0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg shadow-[0_10px_25px_rgba(83,144,245,0.35)] transition-all active:scale-95"
            >
              {loading ? 'Checking...' : 'Check Severity'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScanMethods;
