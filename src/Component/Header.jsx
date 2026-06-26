import React from 'react';
import img1 from '../assets/img1.png'; 
import { Link } from 'react-router-dom';


const Header = () => {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 lg:gap-10 px-0 sm:px-[5%] py-6 md:py-8 lg:py-10 overflow-hidden">
      
      {/* Hero Content */}
      <div className="flex-1 z-10 text-center md:text-left order-2 md:order-1">
        <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-black mb-4 leading-[1.1] tracking-tight">
          <span className=" text-[#2F357D]">Track Your </span>
          <br />
          <span className="inline-block whitespace-nowrap bg-gradient-to-br from-[#5390F5] to-[#6D5DF1] bg-clip-text text-transparent">
            Inner Peace
          </span>
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-slate-500 leading-relaxed mb-10 font-medium max-w-[340px] sm:max-w-md lg:max-w-lg mx-auto md:mx-0">
          Advanced AI-powered emotional tracking to help you understand yourself better and connect with experts.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 md:gap-5"> 
         <Link to="/usersignup" className="self-center sm:self-auto">
  <button className="bg-[#2F357D] text-white backdrop-blur-xl border-2 border-white hover:border-[#2F357D] hover:bg-transparent hover:text-[#2F357D] px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold shadow-sm transition-all duration-300 text-sm md:text-base cursor-pointer active:scale-95 whitespace-nowrap">
    Get Started
  </button>
</Link>
          <button className="self-center sm:self-auto backdrop-blur-xl border border-white hover:text-white text-[#2F357D] px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold shadow-sm hover:bg-[#2F357D] transition-all duration-300 text-sm md:text-base whitespace-nowrap">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Hero Image Container */}
      <div className="flex-[1.1] lg:flex-[1.9] flex justify-center md:justify-end relative order-1 md:order-2 w-full md:w-auto">
        <div className="relative group w-full max-w-[500px] lg:max-w-none flex justify-center md:justify-end items-center">
           {/* Glow Effect */}
           <div className="absolute -inset-5 md:-inset-10 bg-blue-400/15 blur-[60px] md:blur-[100px] rounded-full animate-pulse"></div>
           
           {/* Emojis - Responsive sizes and positions */}
           <div className="absolute top-[18%] left-[10%] lg:left-[28%] text-2xl md:text-3xl animate-[float_3s_ease-in-out_infinite] z-20">😊</div>
           <div className="absolute top-[12%] right-[5%] lg:right-[15%] text-2xl md:text-3xl animate-[float_5s_ease-in-out_infinite] z-20">😇</div>
           <div className="absolute top-[45%] left-[5%] lg:left-[18%] text-2xl md:text-3xl animate-[float_4s_ease-in-out_infinite] z-20">😌</div>
           
           <div className="absolute bottom-[28%] right-[5%] lg:right-[15%] text-2xl md:text-3xl animate-[float_3.5s_ease-in-out_infinite] z-20">😡</div>
           <div className="absolute bottom-[12%] right-[20%] lg:right-[32%] text-2xl md:text-3xl animate-[float_4.5s_ease-in-out_infinite] z-20">😨</div>

           <img 
            src={img1} 
            alt="Emotion Tracking AI" 
            className="w-[82%] sm:w-full max-w-[340px] md:max-w-[420px] lg:max-w-[680px] h-auto z-10 drop-shadow-2xl animate-[float_4s_ease-in-out_infinite]" 
          />
        </div>
      </div>

      {/* Floating Animation Style stays as is */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @media (min-width: 1024px) {
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-30px); }
            }
          }
        `}
      </style>
    </section>
  );
};

export default Header;
