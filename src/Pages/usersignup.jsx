import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { clearError, registerUser, setError } from '../store/slices/authSlice'; 
import bg from "../assets/bg.jpeg";
import logoImg from "../assets/logo.png";

const UserSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { loading, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateFields = () => {
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 3) {
      errors.fullName = 'Full Name must be at least 3 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const resultAction = await dispatch(registerUser({ fullName, email, password }));

    if (registerUser.fulfilled.match(resultAction)) {
      // ✅ Role already saved in authSlice
      alert("Account created! Please check your email for verification.");
      setFullName('');
      setEmail('');
      setPassword('');
      navigate('/auth'); // ✅ Go to AuthHandler for email verification
    } else {
      console.error("Signup failed:", resultAction.payload);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 font-sans overflow-y-auto py-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-[950px] flex flex-col md:flex-row bg-white/70 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/80 overflow-hidden">
        
        <div className="w-full md:w-[58%] p-6 md:p-10">
          <div className="mb-6">
            <img src={logoImg} alt="EmoTrack Logo" className="w-40 h-auto object-contain" />
          </div>

          <h2 className="text-2xl md:text-4xl font-black mb-1 tracking-tight">
            <span className="text-[#5390F5]">Join </span>
            <span className="text-[#2F357D]">EmoTrack</span>
            <span className="text-[#5390F5] block md:inline font-bold"> Community</span>
          </h2>
          <p className="text-[#2F357D] text-sm mb-5 font-medium tracking-wide">
            Start tracking your emotions and progress today.
          </p>
          
          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded-lg text-center font-bold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Full Name
              </label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={validateFields}
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

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2F357D] ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateFields}
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
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter password (Min 6 chars)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={validateFields}
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
              disabled={loading || !fullName.trim() || !email.trim() || !password.trim()}
              className="w-full py-4 bg-[#2F357D] hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 mt-4"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-[#2F357D] text-sm">
            Already have an account?
            <Link to="/userlogin" className="ml-2 text-[#2F357D] font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>

        <div className="hidden md:flex w-full md:w-[42%] bg-gradient-to-br from-blue-600/5 to-indigo-600/15 flex-col items-center justify-center p-10 border-l border-white/40 relative text-center">
          <div className="text-8xl mb-6 animate-bounce drop-shadow-lg">😊</div>
          <div className="relative z-10">
              <h3 className="text-2xl font-black text-[#2F357D] tracking-tight">Your Mind Matters</h3>
              <p className="text-[#2F357D] text-sm mt-3 leading-relaxed max-w-[240px] mx-auto font-medium">
                Quickly access your personal mood tracker and emotional progress.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
