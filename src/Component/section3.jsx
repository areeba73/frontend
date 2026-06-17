import React from 'react';

const StepCard = ({ number, title, desc, active }) => (
  <div className={`relative h-full min-h-[290px] p-6 md:p-8 rounded-[28px] md:rounded-[35px] transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center
    ${active 
      ? 'bg-gradient-to-br bg-[#2F357D] text-white shadow-2xl z-10' 
      : 'bg-transparent backdrop-blur-md border border-white/80 text-slate-800 shadow-lg'}`}>
    
    {/* Step Number Badge */}
    <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl rotate-12 flex items-center justify-center font-black text-xl shadow-lg
      ${active ? 'bg-white text-[#2F357D]' : 'bg-[#2F357D] text-white'}`}>
      <span className="-rotate-12">{number}</span>
    </div>

    <div className="mt-6">
      {/* Icon */}
      <div className={`mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl
        ${active ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
        <span className="text-4xl">
          {number === "1" && "📊"}
          {number === "2" && "🤖"} 
          {number === "3" && "🩺"}
        </span>
      </div>
      
      {/* Title (Minor increase) */}
      <h3 className={`text-[1.6rem] font-bold mb-3 tracking-tight ${active ? 'text-white' : 'text-[#2F357D]'}`}>
  {title}
</h3>
      <p className={`text-[16px] leading-relaxed max-w-[280px] mx-auto ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
        {desc}
      </p>
    </div>

    {/* Glow Effect */}
    {active && (
      <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 -z-10 animate-pulse"></div>
    )}
  </div>
);

const Section3 = () => {
  const steps = [
    { n: "1", t: "Track Emotions", d: "Log your daily feelings with our intuitive mood tracker in seconds.", a: false },
    { n: "2", t: "AI Chatbot Analyze", d: "Our advanced AI detects deep emotional patterns and provides support.", a: true },
    { n: "3", t: "Expert Insights", d: "Connect with certified doctors and get personalized health reports.", a: false }
  ];

  return (
    <section className="py-10 md:py-12 px-0 sm:px-4 max-w-7xl mx-auto">
      {/* Heading (Increased to 4xl) */}
      <div className="flex items-center justify-center gap-4 md:gap-6 mb-10 md:mb-12 text-center">
        <div className="hidden sm:block h-[1px] w-12 md:w-16 bg-[#2F357D]"></div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#2F357D] tracking-tight">How EmoTrack Works</h2>
        <div className="hidden sm:block h-[1px] w-12 md:w-16 bg-[#2F357D]"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, index) => (
          <StepCard 
            key={index}
            number={step.n} 
            title={step.t} 
            desc={step.d} 
            active={step.a} 
          />
        ))}
      </div>
    </section>
  );
};

export default Section3;
