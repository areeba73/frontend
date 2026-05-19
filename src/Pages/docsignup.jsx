// DoctorSignup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { registerDoctor, clearError, setError } from '../store/slices/authSlice';
import bg from "../assets/bg.jpeg";
import logoImg from "../assets/logo.png";

const DoctorSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    speciality: '',
    clinicName: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Full Name must be at least 3 characters';
    }

    if (!formData.speciality.trim()) {
      errors.speciality = 'Speciality is required';
    } else if (formData.speciality.trim().length < 3) {
      errors.speciality = 'Speciality must be at least 3 characters';
    }

    if (!formData.clinicName.trim()) {
      errors.clinicName = 'Clinic Name is required';
    } else if (formData.clinicName.trim().length < 3) {
      errors.clinicName = 'Clinic name must be at least 3 characters';
    }

    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else {
      const mobileClean = formData.mobile.replace(/[-\s]/g, '');
      const mobileRegex = /^(0\d{10}|92\d{10})$/;
      if (!mobileRegex.test(mobileClean)) {
        errors.mobile = 'Please enter a valid 11-digit mobile number (e.g., 03001234567)';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const resultAction = await dispatch(registerDoctor(formData));

    if (registerDoctor.fulfilled.match(resultAction)) {
      // ✅ Role already saved in authSlice
      alert("Doctor Account created! Please check email for verification.");
      navigate('/auth'); // ✅ Go to AuthHandler for email verification
    } else {
      console.log("Registration failed");
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 font-sans overflow-y-auto py-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-[950px] flex flex-col md:flex-row bg-white/70 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/80 overflow-hidden">
        
        <div className="w-full md:w-[58%] p-6 md:p-10 overflow-y-auto max-h-[90vh]">
          <div className="mb-6">
            <img src={logoImg} alt="EmoTrack Logo" className="w-40 h-auto object-contain" />
          </div>

          <h2 className="text-2xl md:text-4xl font-black mb-1 tracking-tight">
            <span className="text-[#5390F5]">Join </span>
            <span className="text-[#2F357D]">EmoTrack</span>
            <span className="text-[#5390F5] block md:inline font-bold"> as a Doctor</span>
          </h2>
          <p className="text-[#2F357D] text-sm mb-5 font-medium tracking-wide">
            Register to manage your clinic and patients.
          </p>

          {error && (
            <div className="mt-3 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded-lg text-center font-bold">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Full Name
              </label>
              <input 
                name="fullName" 
                onChange={handleChange} 
                onBlur={validateFields}
                value={formData.fullName}
                type="text" 
                placeholder="Enter your full name" 
                className={`w-full px-3 py-3 rounded-lg bg-white/60 border shadow-sm focus:ring-2 outline-none text-xs transition-all ${
                  fieldErrors.fullName
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-100 focus:ring-blue-400'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-red-600 mt-0.5">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Speciality */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Speciality
              </label>
              <input 
                name="speciality" 
                onChange={handleChange} 
                onBlur={validateFields}
                value={formData.speciality}
                type="text" 
                placeholder="e.g., Psychology" 
                className={`w-full px-3 py-3 rounded-lg bg-white/60 border shadow-sm focus:ring-2 outline-none text-xs transition-all ${
                  fieldErrors.speciality
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-100 focus:ring-blue-400'
                }`}
              />
              {fieldErrors.speciality && (
                <p className="text-xs text-red-600 mt-0.5">{fieldErrors.speciality}</p>
              )}
            </div>

            {/* Clinic Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Clinic Name
              </label>
              <input 
                name="clinicName" 
                onChange={handleChange} 
                onBlur={validateFields}
                value={formData.clinicName}
                type="text" 
                placeholder="Enter clinic name" 
                className={`w-full px-3 py-3 rounded-lg bg-white/60 border shadow-sm focus:ring-2 outline-none text-xs transition-all ${
                  fieldErrors.clinicName
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-100 focus:ring-blue-400'
                }`}
              />
              {fieldErrors.clinicName && (
                <p className="text-xs text-red-600 mt-0.5">{fieldErrors.clinicName}</p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Mobile Number
              </label>
              <input 
                name="mobile" 
                onChange={handleChange} 
                onBlur={validateFields}
                value={formData.mobile}
                type="tel" 
                placeholder="03001234567" 
                className={`w-full px-3 py-3 rounded-lg bg-white/60 border shadow-sm focus:ring-2 outline-none text-xs transition-all ${
                  fieldErrors.mobile
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-100 focus:ring-blue-400'
                }`}
              />
              {fieldErrors.mobile && (
                <p className="text-xs text-red-600 mt-0.5">{fieldErrors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                name="email" 
                onChange={handleChange} 
                onBlur={validateFields}
                value={formData.email}
                type="email" 
                placeholder="Enter your email" 
                className={`w-full px-3 py-3 rounded-lg bg-white/60 border shadow-sm focus:ring-2 outline-none text-xs transition-all ${
                  fieldErrors.email
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-100 focus:ring-blue-400'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-0.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  onChange={handleChange} 
                  onBlur={validateFields}
                  value={formData.password}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (Min 6 chars)" 
                  className={`w-full px-3 py-3 rounded-lg bg-white/60 border shadow-sm focus:ring-2 outline-none text-xs transition-all pr-8 ${
                    fieldErrors.password
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-100 focus:ring-blue-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <AiOutlineEye size={16} /> : <AiOutlineEyeInvisible size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-0.5">{fieldErrors.password}</p>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={loading || !formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.speciality.trim() || !formData.clinicName.trim() || !formData.mobile.trim()}
              className="md:col-span-2 w-full mt-4 py-4 bg-[#2F357D] hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-center text-[#2F357D] text-sm">
            Already have an account?
            <Link to="/doclogin" className="ml-2 text-[#2F357D] font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>

        <div className="hidden md:flex w-full md:w-[42%] bg-gradient-to-br from-blue-600/5 to-indigo-600/15 flex-col items-center justify-center p-10 border-l border-white/40">
           <img src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg" alt="doctor" className="w-48 h-48 rounded-full object-cover border-[8px] border-white shadow-2xl" />
           <div className="mt-10 text-center">
              <h3 className="text-2xl font-black text-[#2F357D]">Premium Healthcare</h3>
              <p className="text-slate-500 text-sm mt-3">Join professionals managing health data securely.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;