import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPaperPlane } from 'react-icons/fa'; 
import logo from '../assets/LOGO.png';

const Footer = () => {
  return (
    <footer className="relative bg-white/5 backdrop-blur-md border-t border-white/20 px-4 sm:px-6 lg:px-[5%] pt-12 sm:pt-16 pb-8 sm:pb-10 font-sans overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-10 left-10 w-40 h-40 md:w-72 md:h-72 bg-[#5390F5]/10 rounded-full blur-[60px] md:blur-[100px] -z-10"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 md:w-72 md:h-72 bg-[#2F357D]/10 rounded-full blur-[60px] md:blur-[100px] -z-10"></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12 sm:mb-16">
          
          {/* 1. Brand & Socials */}
          <div className="flex flex-col space-y-6 items-center sm:items-start text-center sm:text-left">
            <Link to="/" className="p-2 bg-white/10 backdrop-blur-lg rounded-2xl inline-block border border-white/10 transition-transform hover:scale-105">
              <img src={logo} alt="EmoTrack" className="h-[50px] w-auto object-contain" />
            </Link>
            <p className="text-[#2F357D]/70 leading-relaxed text-[0.95rem] font-medium">
              Empathic technology for a clearer mind. Your privacy and wellbeing are our top priorities.
            </p>
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-[#2F357D]/5 flex items-center justify-center text-[#2F357D] hover:bg-[#2F357D] hover:text-white transition-all border border-[#2F357D]/10">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-[#2F357D] text-[0.8rem] font-bold mb-6 tracking-widest uppercase opacity-80">Navigation</h4>
            <ul className="space-y-3">
              {[{name:'Home', path:'/'}, {name:'Dashboard', path:'/userdash'}, {name:'Doctors', path:'/doctors'}, {name:'Emotions Scan', path:'/scan'}].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[#2F357D]/60 text-[0.9rem] font-medium hover:text-[#5390F5] transition-all flex items-center group">
                    <span className="w-0 h-[1.5px] bg-[#5390F5] group-hover:w-3 transition-all mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Support */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-[#2F357D] text-[0.8rem] font-bold mb-6 tracking-widest uppercase opacity-80">Support</h4>
            <ul className="space-y-3">
              {['Help Center', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-[#2F357D]/60 text-[0.9rem] font-medium hover:text-[#5390F5] transition-all flex items-center group">
                    <span className="w-0 h-[1.5px] bg-[#5390F5] group-hover:w-3 transition-all mr-0 group-hover:mr-2"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Newsletter (The Space Filler) */}
          <div className="flex flex-col items-center sm:items-start sm:col-span-2 lg:col-span-1">
            <h4 className="text-[#2F357D] text-[0.8rem] font-bold mb-6 tracking-widest uppercase opacity-80">Stay Updated</h4>
            <p className="text-[#2F357D]/60 text-[0.85rem] mb-4 text-center sm:text-left">Subscribe for mental health tips.</p>
            <div className="relative w-full max-w-sm sm:max-w-none">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-[#2F357D]/5 border border-[#2F357D]/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#5390F5]/50 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2F357D] text-white p-2 rounded-lg hover:bg-[#5390F5] transition-all">
                <FaPaperPlane size={12} />
              </button>
            </div>
          </div>

        </div>
        
        {/* Footer Bottom */}
        <div className="pt-8 border-t border-[#2F357D]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[#2F357D]/40 text-[0.8rem] font-medium">
            © 2026 <span className="text-[#2F357D]/80 font-bold">EmoTrack</span>. Crafted for Mental Clarity.
          </p>
          <div className="flex gap-6 text-[#2F357D]/40 text-[0.8rem] font-medium italic text-center sm:text-right">
             Keep your mind healthy.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
