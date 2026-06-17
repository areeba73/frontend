import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';


const Section8 = () => {
  return (
    // Responsive padding logic
    <div className="w-full flex flex-col items-center justify-center px-0 sm:px-4 md:px-6 pt-4 md:pt-6 pb-4 font-sans overflow-hidden">
      
      <div className="relative group max-w-3xl w-full">
        
        {/* Floating Heart Icon - Responsive positioning */}
        <div className="absolute -top-6 -right-2 md:-top-1 md:-right-10 animate-bounce transition-transform duration-1000 z-20">
          <span className="text-4xl md:text-6xl">
            💙
          </span>
        </div>

        {/* Glossy Container - Responsive rounding and padding */}
        <div className="relative overflow-hidden bg-transparent border border-white/80 rounded-[30px] md:rounded-[40px] px-6 py-10 md:px-8 md:py-12 text-center shadow-lg backdrop-blur-sm">
          
          {/* Background subtle glow inside container */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-400/10 to-transparent pointer-events-none"></div>

          {/* Responsive Heading */}
          <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-bold text-[#2F357D] mb-8 md:mb-10 tracking-tight leading-tight">
            Start your emotional <br className="md:hidden" /> journey today
          </h2>
          
          {/* Premium Glow Button - Responsive scaling */}
         <Link to="/usersignup" className="inline-block w-full sm:w-auto">
  <button className="relative group/btn transition-all duration-300 active:scale-95 w-full sm:w-auto cursor-pointer overflow-hidden">
    
    {/* Animated Background Blur */}
    
    {/* Shimmer Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition duration-500 -translate-x-full group-hover/btn:translate-x-full"></div>
    
    {/* Inner Border Glow */}
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover/btn:opacity-50 transition duration-500 p-0.5"></div>

    {/* Main Button */}
    <div className="relative bg-gradient-to-br from-[#2F357D] via-[#1a1f5d] to-blue-900 rounded-3xl flex items-center justify-center gap-3 shadow-2xl px-6 sm:px-8 md:px-14 py-4 sm:py-5 md:py-6 border border-blue-400/30 group-hover/btn:border-blue-300/60 transition-all">
      
      {/* Sparkle Icon */}
      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 group-hover/btn:text-yellow-300 group-hover/btn:animate-spin transition-all" />
      
      <span className="text-white font-bold text-base sm:text-lg md:text-xl tracking-wider group-hover/btn:text-transparent group-hover/btn:bg-gradient-to-r group-hover/btn:from-blue-200 group-hover/btn:to-cyan-200 group-hover/btn:bg-clip-text transition-all duration-300">
        Create Free Account
      </span>
      
      {/* Arrow Icon */}
      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 group-hover/btn:text-cyan-300 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all" />
    </div>
  </button>
</Link>
          
        </div>

        {/* Decorative sparkles effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
            <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-10 right-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        </div>

      </div>
    </div>
  );
};

export default Section8;
