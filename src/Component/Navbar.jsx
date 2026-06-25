import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiChevronDown, HiMenuAlt3, HiX } from 'react-icons/hi';
import logo from '../assets/LOGO.png';
import { logout } from '../store/slices/authSlice';

const dashboardPaths = {
  admin: '/admindash',
  doctor: '/dctrdash',
  user: '/userdash',
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);
  const hasSession = Boolean(isAuthenticated && user && localStorage.getItem('token'));
  const dashboardPath = dashboardPaths[role] || '/userdash';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(hasSession ? [{ name: 'Dashboard', path: dashboardPath }] : []),
    { name: 'Doctors', path: '/doctors' },
    { name: 'Chatbot', path: '/chatbot' },
    { name: 'Result', path: '/result' },
    { name: 'Emotions Scan', path: '/scan' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 px-[5%] flex justify-between items-center
      ${scrolled
        ? 'h-[70px] bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#edf2f7]'
        : 'h-[95px] bg-transparent border-b border-transparent'}`}>

      <Link to="/" className="flex items-center z-[1100]">
        <img
          src={logo}
          alt="EmoTrack Logo"
          className={`transition-all duration-300 ${scrolled ? 'h-[40px] md:h-[45px]' : 'h-[50px] md:h-[55px]'}`}
        />
      </Link>

      <div className={`hidden lg:flex items-center px-6 py-2 rounded-full border transition-all duration-500
        ${scrolled
          ? 'border-transparent bg-transparent'
          : 'border-white/40 bg-white/20 backdrop-blur-md'}`}>
        <ul className="flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`text-sm font-bold transition-all ${isActive ? 'text-blue-500' : 'text-slate-700 hover:text-blue-500'}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3 md:gap-4 z-[1100]">
        {hasSession ? (
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white text-[#2F357D] px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold border border-[#2F357D]/20 hover:bg-[#2F357D] hover:text-white transition-all"
          >
            Logout
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-[#2F357D] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold shadow-lg shadow-blue-200 border border-gray-300 hover:bg-white hover:text-[#2F357D] transition-all flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Join</span>
              <HiChevronDown className={`text-sm transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36 md:w-40 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col py-1">
                  <Link
                    to="/docsignup"
                    onClick={() => setShowDropdown(false)}
                    className="px-4 py-2 text-[11px] font-bold text-[#2F357D] hover:bg-slate-50 transition-all"
                  >
                    As a Doctor
                  </Link>
                  <div className="h-[1px] bg-slate-100 mx-2"></div>
                  <Link
                    to="/usersignup"
                    onClick={() => setShowDropdown(false)}
                    className="px-4 py-2 text-[11px] font-bold text-[#2F357D] hover:bg-slate-50 transition-all"
                  >
                    As a Patient
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="lg:hidden text-2xl text-[#2F357D] p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      <div className={`fixed inset-0 bg-white z-[1050] lg:hidden transition-transform duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-[#2F357D] hover:text-blue-500 transition-all"
            >
              {link.name}
            </Link>
          ))}
          {hasSession && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-2xl font-black text-[#2F357D] hover:text-blue-500 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
