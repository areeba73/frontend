import React from 'react'
import Navbar from '../Component/Navbar'
import Header from '../Component/Header'
import Section3 from '../Component/section3'
import Section4 from '../Component/section4'
import Section5 from '../Component/section5'
import Section6 from '../Component/section6'
import FAQ from '../Component/faq'
import Section8 from '../Component/section8'
import Footer from '../Component/Footer'
import bg from "../assets/bg.jpeg"

function Home() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-cover bg-scroll md:bg-fixed bg-center" style={{ backgroundImage: `url(${bg})` }}>
        <div className="bg-white/30 backdrop-blur-[2px] min-h-screen">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 lg:pt-32 space-y-10 sm:space-y-12 lg:space-y-16 pb-12 lg:pb-16">
            
            <Header />
            <Section3 />
            <Section4 />
             <Section5 />
             <Section6 />
             <FAQ />
              <Section8 />
            
          </main>
        </div>
        <Footer />
      </div>
    </div>
  )
}

// Helper components as before...
const FeatureCard = ({ title, desc, icon }) => (
  <div className="bg-white/50 backdrop-blur-md p-6 rounded-[30px] border border-white/80 text-center">
    <div className="text-2xl mb-3 bg-white w-12 h-12 flex items-center justify-center rounded-2xl mx-auto shadow-sm">{icon}</div>
    <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
  </div>
);

const StatBox = ({ value, label, color }) => (
  <div>
    <h3 className={`text-5xl font-black ${color} mb-2 tracking-tight`}>{value}</h3>
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{label}</p>
  </div>
);

export default Home;
