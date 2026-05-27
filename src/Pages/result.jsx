import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import bg from "../assets/bg.jpeg";
import { fetchEmotionHistory } from '../store/slices/emotionSlice';

const emotionLabels = {
  angry: 'Angry',
  anger: 'Angry',
  disgust: 'Disgusted',
  disgusted: 'Disgusted',
  fear: 'Fearful',
  fearful: 'Fearful',
  happy: 'Happy',
  joy: 'Happy',
  neutral: 'Neutral',
  sad: 'Sad',
  sadness: 'Sad',
  surprise: 'Surprised'
};

const typeLabels = {
  face: 'Face Scan',
  voice: 'Voice Scan',
  text: 'Text Scan',
  multimodal: 'Overall Severity Check'
};

const severityStyles = {
  Low: {
    text: 'text-[#2F855A]',
    bar: 'from-[#68D391] to-[#38A169]',
    bg: 'bg-green-100'
  },
  Medium: {
    text: 'text-[#B7791F]',
    bar: 'from-[#F6E05E] to-[#D69E2E]',
    bg: 'bg-yellow-100'
  },
  High: {
    text: 'text-[#E53E3E]',
    bar: 'from-[#FF8A8A] to-[#E53E3E]',
    bg: 'bg-red-100'
  }
};

const Result = () => {
  const dispatch = useDispatch();
  const { latestAnalysis, history, loading } = useSelector((state) => state.emotions);
  const result = latestAnalysis || history?.[0] || null;
  const hasSeverity = result?.type === 'multimodal' && result?.severity;
  const severity = hasSeverity ? result.severity : { level: 'Low', score: 0 };
  const style = severityStyles[severity.level] || severityStyles.Low;
  const emotion = emotionLabels[(result?.emotion || '').toLowerCase()] || result?.emotion || 'No result yet';
  const confidence = Math.round((result?.confidence || 0) * 100);
  const scanType = typeLabels[result?.type] || 'Emotion Scan';

  useEffect(() => {
    if (!latestAnalysis && localStorage.getItem('token')) {
      dispatch(fetchEmotionHistory({ days: 7 }));
    }
  }, [dispatch, latestAnalysis]);

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-fixed bg-center relative font-sans"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Navbar />

      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-32">
        <div className="w-full max-w-[900px] bg-white/40 backdrop-blur-3xl border border-white/40 rounded-[40px] p-4 md:p-8 shadow-2xl flex flex-col gap-6">
          {!result && !loading ? (
            <div className="bg-white/85 rounded-[28px] p-8 shadow-sm border border-white/50 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2F357D] mb-4">
                No Scan Result Yet
              </h2>
              <p className="text-[#718096] mb-6">
                Run a face, voice, or text scan to see your emotion result here.
              </p>
              <Link to="/scan" className="inline-flex bg-[#2F357D] text-white px-8 py-3 rounded-full font-semibold">
                Start Scan
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white/85 rounded-[28px] p-8 shadow-sm border border-white/50">
                <p className="text-[#718096] text-xs uppercase tracking-[0.2em] font-bold mb-2 opacity-70">
                  {scanType}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#2F357D] mb-4">
                  {hasSeverity ? (
                    <>
                      Overall Stress Level: <span className={style.text}>{severity.level}</span>
                    </>
                  ) : (
                    <>
                      You're Feeling <span className="text-[#2F357D]">{emotion}</span>
                    </>
                  )}
                </h2>
                <p className="text-[#718096] text-base md:text-lg leading-relaxed max-w-xl">
                  {hasSeverity ? (
                    <>
                      Severity is calculated from your face, voice, and text emotion results. Dominant combined emotion is <span className="font-semibold text-[#2F357D]">{emotion}</span>.
                    </>
                  ) : (
                    <>
                      Confidence is <span className="font-semibold text-[#2F357D]">{confidence}%</span>. Complete all three scans and press Check Severity for the overall stress level.
                    </>
                  )}
                </p>
              </div>

              {hasSeverity ? (
                <div className="bg-white/85 rounded-[28px] p-8 shadow-sm border border-white/50 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex items-center gap-6">
                    <div className={`text-2xl px-5 py-4 rounded-2xl shadow-sm border border-white ${style.bg} ${style.text} font-bold`}>
                      {severity.level.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[#718096] text-xs uppercase tracking-[0.2em] font-bold mb-1 opacity-70">
                        Multimodal Analysis
                      </p>
                      <p className="text-[#2F357D] text-2xl font-bold">
                        Stress Level: <span className={style.text}>{severity.level}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[#718096] text-xs font-bold tracking-wider uppercase opacity-60">
                        Severity Scale
                      </span>
                      <span className={`${style.text} text-sm font-bold`}>{severity.score}%</span>
                    </div>
                    <div className="w-full h-5 bg-gray-100/50 rounded-full overflow-hidden p-1 border border-gray-200/50 shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r ${style.bar} rounded-full transition-all duration-1000`}
                        style={{ width: `${severity.score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between px-2 text-[10px] font-bold text-[#A0AEC0] uppercase tracking-tighter">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/85 rounded-[28px] p-8 shadow-sm border border-white/50 flex items-center gap-6">
                  <div className="text-2xl px-5 py-4 rounded-2xl shadow-sm border border-white bg-[#EEF2FF] text-[#2F357D] font-bold">
                    {emotion.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[#718096] text-xs uppercase tracking-[0.2em] font-bold mb-1 opacity-70">
                      Emotion Result
                    </p>
                    <p className="text-[#2F357D] text-2xl font-bold">
                      {emotion} <span className="text-base text-[#718096]">({confidence}%)</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-[#EEF2FF]/70 backdrop-blur-md rounded-[28px] p-8 border border-white/60">
                <h3 className="text-[#2F357D] text-lg font-semibold mb-3 text-center">
                  Suggested Next Step
                </h3>
                <p className="text-[#718096] text-center mb-8">
                  {result?.suggestion || 'Take a short break and check in with yourself.'}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/chatbot" className="no-underline">
                    <button className="bg-[#2F357D] hover:bg-[#3d45a1] text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-lg shadow-blue-200">
                      Talk to Chatbot
                    </button>
                  </Link>
                  <Link to="/scan" className="no-underline">
                    <button className="bg-white/80 hover:bg-white text-[#2F357D] border border-[#2F357D]/20 px-8 py-3.5 rounded-full font-medium transition-all shadow-sm">
                      Scan Again
                    </button>
                  </Link>
                  <Link to="/doctors" className="no-underline">
                    <button className="bg-white/80 hover:bg-white text-[#2F357D] border border-[#2F357D]/20 px-8 py-3.5 rounded-full font-medium transition-all shadow-sm">
                      Find a Doctor
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Result;
