import React from 'react';

const FeatureCard = ({ title, desc, icon }) => (
  <div className="group relative bg-white/60 backdrop-blur-md p-5 md:p-6 rounded-[30px] md:rounded-[35px] border border-white/80 transition-all duration-500 hover:-translate-y-3 hover:bg-[#2F357D] hover:shadow-[0_25px_50px_rgba(47,53,125,0.2)] flex flex-col items-center text-center h-full">
    
    <div className="text-2xl md:text-3xl mb-4 bg-white w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500 group-hover:bg-white/20">
      {icon}
    </div>
    
    <h3 className="text-[1rem] md:text-[1.1rem] font-bold text-[#2F357D] mb-2 group-hover:text-white transition-colors duration-300 leading-tight">
      {title}
    </h3>
    
    <p className="text-[12px] md:text-[13px] text-slate-500 leading-tight group-hover:text-indigo-100 transition-colors duration-300">
      {desc}
    </p>

    <div className="absolute inset-0 rounded-[35px] bg-indigo-400 blur-2xl opacity-0 group-hover:opacity-10 -z-10 transition-opacity"></div>
  </div>
);

const Section4 = () => {
  const features = [
    { i: "💜", t: "AI Mood Insights", d: "Log your daily emotions with smart tracking." },
    { i: "🔒", t: "100% Private", d: "Your emotional data is always encrypted." },
    { i: "🛡️", t: "Secure Connect", d: "Safe space to talk with Professionals." },
    { i: "📊", t: "Advanced Analytics", d: "Deep dive into your emotional trends." },
    { i: "📝", t: "Smart Journal", d: "Express yourself with AI-guided journaling." }
  ];

  return (
    <section className="text-center px-0 sm:px-6 py-10 md:py-12 max-w-7xl mx-auto overflow-hidden">
      {/* Heading - Adjusted for Mobile */}
      <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="hidden sm:block h-[1px] w-12 md:w-16 bg-[#2F357D]/30"></div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#2F357D] tracking-tight">
          Why Choose <span className="text-blue-500 md:text-[#2F357D]">EmoTrack?</span>
        </h2>
        <div className="hidden sm:block h-[1px] w-12 md:w-16 bg-[#2F357D]/30"></div>
      </div>

      {/* Responsive Grid Logic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {features.map((item, index) => (
          <div key={index} className={index === 4 ? "sm:col-span-2 lg:col-span-1" : ""}>
            <FeatureCard 
              icon={item.i} 
              title={item.t} 
              desc={item.d} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Section4;
