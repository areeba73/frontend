import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import bg from "../assets/bg.jpeg";
import { LogOut, Calendar, Clock,  } from 'lucide-react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { fetchEmotionHistory } from '../store/slices/emotionSlice';

const moodConfig = {
  happy: { label: "Happy", emoji: "😊" },
  sad: { label: "Sad", emoji: "😢" },
  angry: { label: "Angry", emoji: "😠" },
  neutral: { label: "Neutral", emoji: "😐" },
  fear: { label: "Fear", emoji: "😨" },
  surprise: { label: "Surprise", emoji: "😲" },
  disgust: { label: "Disgust", emoji: "🤢" }
};

const moodColors = {
  happy: "bg-[#2F357D]/80",
  sad: "bg-[#2F357D]/80",
  angry: "bg-[#2F357D]/80",
  neutral: "bg-[#2F357D]/80",
  fear: "bg-[#2F357D]/80",
  surprise: "bg-[#2F357D]/80",
  disgust: "bg-[#2F357D]/80"
};

const emotionRisk = {
  happy: 8,
  joy: 8,
  neutral: 24,
  surprise: 42,
  sad: 82,
  sadness: 82,
  angry: 90,
  anger: 90,
  fear: 95,
  fearful: 95,
  disgust: 78,
  disgusted: 78
};

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { history, loading } = useSelector((state) => state.emotions);
  const [showAllReflections, setShowAllReflections] = useState(false);

  useEffect(() => {
    dispatch(fetchEmotionHistory({ days: 7 }));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const moodData = useMemo(() => {
    const byDate = new Map();

    (history || []).forEach((item) => {
      const dateKey = item.date || item.timestamp?.slice?.(0, 10);
      if (!dateKey || item.type === 'multimodal') return;
      const existing = byDate.get(dateKey);
      if (!existing || new Date(item.timestamp || 0) > new Date(existing.timestamp || 0)) {
        byDate.set(dateKey, item);
      }
    });

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const item = byDate.get(key);
      const type = (item?.emotion || 'neutral').toLowerCase();

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        type: moodConfig[type] ? type : 'neutral',
        value: item ? Math.max(8, Math.round((Number(item.confidence) || 0.5) * 100)) : 8
      };
    });
  }, [history]);

  const recentEmotions = useMemo(() => (
    (history || [])
      .filter((item) => item.emotion && ['face', 'voice', 'text'].includes(item.type))
      .map((item) => {
        const type = (item.emotion || 'neutral').toLowerCase();
        const config = moodConfig[type] || moodConfig.neutral;
        const date = item.timestamp
          ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : item.date || 'Recent';

        return {
          date,
          text: `${item.type || 'scan'} detected ${config.label}`,
          emoji: config.emoji
        };
      })
  ), [history]);

  const visibleReflections = showAllReflections ? recentEmotions : recentEmotions.slice(0, 3);

  const balance = useMemo(() => {
    const records = history || [];
    const latestSeverity = records.find((item) => item.type === 'multimodal' && item.severity?.score !== undefined);

    if (latestSeverity) {
      const score = Math.max(0, Math.min(100, Number(latestSeverity.severity.score) || 0));
      const balanceScore = 100 - score;

      return {
        percent: balanceScore,
        label: balanceScore >= 70 ? 'Stable' : balanceScore >= 40 ? 'Moderate' : 'Needs Care',
        note: latestSeverity.suggestion || 'Based on your latest combined emotion severity.'
      };
    }

    const recent = records.filter((item) => item.emotion).slice(0, 7);
    if (!recent.length) {
      return {
        percent: 0,
        label: 'No Data',
        note: 'Run emotion scans to calculate your balance score.'
      };
    }

    const averageRisk = recent.reduce((sum, item) => {
      const emotion = (item.emotion || 'neutral').toLowerCase();
      const risk = emotionRisk[emotion] ?? 35;
      const confidence = Number(item.confidence) || 0.5;
      return sum + (risk * confidence);
    }, 0) / recent.length;
    const balanceScore = Math.round(Math.max(0, Math.min(100, 100 - averageRisk)));

    return {
      percent: balanceScore,
      label: balanceScore >= 70 ? 'Stable' : balanceScore >= 40 ? 'Moderate' : 'Needs Care',
      note: 'Calculated from your recent saved emotion scans.'
    };
  }, [history]);

  // Appointment Data (Email-based)
  const upcomingAppointments = [
  { 
    doctor: "Dr. Sarah Ahmed", 
    specialty: "Psychologist", 
    date: "April 25, 2024", 
    time: "10:30 AM",
    status: "pending" // Ya "approved"
  }
];

  return (
    <div className="min-h-screen relative font-sans text-blue-900 overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={bg} alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
      </div>

      <Navbar />

      <main className="pt-24 md:pt-32 pb-24 px-4 md:px-10 lg:px-20 max-w-[1600px] mx-auto animate-fadeIn">
        
        {/* HEADER */}
        <div className="text-center md:text-left mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2F357D] tracking-tight">
            Welcome back, {user?.fullName || user?.name || 'User'} <span className="inline-block animate-bounce">😊</span>
          </h2>
          <p className="text-[#2F357D] mt-2 font-medium">Your emotional insights dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          
          {/* CHART SECTION */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/50 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-xl md:text-2xl font-bold text-[#2F357D]">Weekly Mood Flow</h3>
              <div className="flex flex-wrap gap-2 p-1.5 bg-white/50 rounded-2xl border border-white/50">
                {Object.values(moodConfig).map((m, i) => (
                  <span key={i} className="text-lg hover:scale-125 transition-transform cursor-help" title={m.label}>{m.emoji}</span>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-[220px] md:h-[260px] w-full px-2 mt-auto">
              {moodData.map((item, i) => (
                <div key={i} className="group relative flex flex-col items-center justify-end flex-1 h-full">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-blue-900 text-white px-2 py-1 rounded-lg shadow text-[10px] font-bold z-10">
                    {moodConfig[item.type].emoji} {loading ? '...' : `${item.value}%`}
                  </div>
                  <div className="relative flex items-end h-full w-full justify-center">
                    <div className="absolute bottom-0 w-[18px] sm:w-[24px] md:w-[30px] h-full bg-blue-100/30 rounded-full"></div>
                    <div
                      className={`${moodColors[item.type]} w-[18px] sm:w-[24px] md:w-[30px] rounded-full shadow-lg transition-all duration-1000 ease-out hover:brightness-110`}
                      style={{ 
                        height: `${item.value}%`,
                        animation: `slideUp 1.2s ease-out ${i * 0.1}s forwards`,
                        opacity: 0 
                      }}
                    />
                  </div>
                  <span className="text-[10px] mt-3 text-blue-900/50 font-bold uppercase tracking-tighter">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BALANCE CARD */}
          <div className="bg-[#2F357D] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-between border border-white/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <h3 className="text-white text-xl font-bold z-10 w-full text-center">Overall Balance</h3>
            <div className="relative flex items-center justify-center z-10 flex-grow">
              <div className="absolute w-52 h-52 rounded-full border-2 border-white/5 animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute w-44 h-44 rounded-full border border-white/10 animate-[spin_10s_linear_infinite_reverse]"></div>
              <div className="relative w-40 h-40 rounded-full border-[12px] border-white/10 border-t-white flex items-center justify-center shadow-inner bg-black/5 backdrop-blur-sm">
                <div className="text-center">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {loading ? '...' : `${balance.percent}%`}
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-100 font-bold mt-1">{balance.label}</p>
                </div>
              </div>
            </div>
            <div className="z-10 text-white/60 text-[11px] font-medium italic text-center px-4">
              "{balance.note}"
            </div>
          </div>

          {/* APPOINTMENT SECTION */}
         
          <div className="lg:col-span-3 mt-8">
            <h3 className="text-2xl font-bold mb-6 text-[#2F357D] px-2">Booked Appointment</h3>
            {upcomingAppointments.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-blue-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#2F357D] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Calendar size={32} />
                  </div>
                  
                  <div>
                    
                    <h4 className="text-xl font-bold text-[#2F357D]">{upcomingAppointments[0].doctor}</h4>
                    <p className="text-sm text-blue-600 font-semibold">{upcomingAppointments[0].specialty}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    <Calendar size={16} className="text-[#2F357D]" />
                    <span className="text-sm font-bold text-[#2F357D]">{upcomingAppointments[0].date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    <Clock size={16} className="text-[#2F357D]" />
                    <span className="text-sm font-bold text-[#2F357D]">{upcomingAppointments[0].time}</span>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-xs font-bold border ${
    upcomingAppointments[0].status === 'approved' 
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }`}>
    {upcomingAppointments[0].status === 'approved' ? '● Approved' : '○ Pending'}
  </div>
                 
                </div>
              </div>
            ) : (
              <div className="text-center p-10 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-blue-200">
                <p className="text-blue-900/50 font-medium">No appointments booked yet via email.</p>
              </div>
            )}
          </div>

          {/* REFLECTIONS */}
          <div className="lg:col-span-3 mt-4">
            <div className="flex items-center justify-between gap-4 mb-6 px-2">
              <h3 className="text-2xl font-bold text-[#2F357D]">Recent Reflections</h3>
              {recentEmotions.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllReflections((value) => !value)}
                  className="text-xs font-bold text-[#2F357D] bg-white/70 border border-white px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all"
                >
                  {showAllReflections ? 'Show Less' : `View All (${recentEmotions.length})`}
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(visibleReflections.length ? visibleReflections : [
                { date: "No scans", text: "Run an emotion scan to see your results here.", emoji: "😐" }
              ]).map((ref, i) => (
                <div 
                  key={i} 
                  className="bg-white/60 backdrop-blur-xl p-4 rounded-[1.8rem] border border-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  style={{ animation: `fadeIn 0.8s ease-out ${i * 0.2}s forwards`, opacity: 0 }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest">{ref.date}</span>
                    <span className="text-xl group-hover:scale-110 transition-transform">{ref.emoji}</span>
                  </div>
                  <p className="text-[13px] text-blue-900/80 leading-snug font-medium line-clamp-1">{ref.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* FIXED LOGOUT BUTTON (Bottom Right) */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-red-500 hover:text-white text-red-600 px-6 py-3 rounded-full font-bold transition-all duration-300 border border-red-500/20 shadow-2xl group"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">Logout</span>
        <LogOut size={20} />
      </button>

      <Footer />

      <style>{`
        @keyframes slideUp { from { height: 0; opacity: 0; } to { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default UserDashboard;
