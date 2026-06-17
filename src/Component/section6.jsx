import React from 'react';
import Face from "../assets/face.png"; 
import Doctor from "../assets/doctor.png"; 
import Admin from "../assets/admin.png"; 




const Section6 = () => {
  return (
    // Main Wrapper: Deep Blue to Dark Gradient
    <div className="flex flex-col items-center justify-center py-8 md:py-12 font-sans text-white">
      
      {/* SECTION 1: Glossy Cards Container */}
      <div className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full max-w-6xl">
        
{/* User Card */}
<div className="relative overflow-hidden bg-transparent border border-white rounded-[30px] md:rounded-[35px] w-full max-w-[350px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 group">
  <img 
    src={Face} 
    alt="User" 
    className="w-full h-72 object-cover object-top rounded-t-[35px] transition-transform duration-500 group-hover:scale-105" 
  />
  <div className="p-6">
    <h3 className="text-[#2F357D] text-2xl font-bold mb-2 tracking-wide uppercase">For Users</h3>
    <p className="text-[#2F357D]/80 font-medium">Track Your Emotions</p>
  </div>
</div>

{/* Doctor Card */}
<div className="relative overflow-hidden bg-transparent border border-white rounded-[30px] md:rounded-[35px] w-full max-w-[350px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 group">
  <img 
    src={Doctor} 
    alt="Doctor" 
    className="w-full h-72 object-cover object-top rounded-t-[35px] transition-transform duration-500 group-hover:scale-105" 
  />
  <div className="p-6">
    <h3 className="text-[#2F357D] text-2xl font-bold mb-1 tracking-wide">For Doctors</h3>
    <p className="text-[#2F357D]/80 font-medium">Support Your Patients</p>
  </div>
</div>

{/* Admin Card */}
<div className="relative overflow-hidden bg-transparent border border-white rounded-[30px] md:rounded-[35px] w-full max-w-[350px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 group">
  <img 
    src={Admin} 
    alt="Admin" 
    className="w-full h-72 object-cover object-top rounded-t-[35px] transition-transform duration-500 group-hover:scale-105" 
  />
  <div className="p-6">
    <h3 className="text-[#2F357D] text-2xl font-bold mb-1 tracking-wide">For Admin</h3>
    <p className="text-[#2F357D]/80 font-medium">Manage the System</p>
  </div>
</div>    
      </div>
    </div>
  );
};

export default Section6;
