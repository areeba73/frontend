import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';  
import { useNavigate } from 'react-router-dom'; 
import { 
  fetchAdminProfile,
  fetchUsers, 
  fetchDoctors, 
  deleteUser, 
  deleteDoctor, 
  fetchStats,
  updateAdminProfile 
} from '../store/slices/adminSlice';
import bg from "../assets/bg.jpeg";
import { Link } from 'react-router-dom'; 
import logo from '../assets/LOGO.png';
import { LogOut } from 'lucide-react'; 

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { adminProfile, users, doctors, stats, loading, error } = useSelector(state => state.admin);
  
  const [activeTab, setActiveTab] = useState('users');
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminData, setAdminData] = useState({
    name: '',
    email: ''
  });

  // Fetch admin profile on mount
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchAdminProfile(user.uid));
      dispatch(fetchUsers());
      dispatch(fetchDoctors());
      dispatch(fetchStats());
    }
  }, [dispatch, user]);

  // Update local state when profile loads
  useEffect(() => {
    if (adminProfile && adminProfile.name) {
      setAdminData({
        name: adminProfile.name || '',
        email: adminProfile.email || ''
      });
    }
  }, [adminProfile]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this record?")) {
      if (activeTab === 'users') {
        dispatch(deleteUser(id));
      } else {
        dispatch(deleteDoctor(id));
      }
    }
  };

  const handleLogout = () => {  
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      navigate('/');
    }
  };

  const handleSaveSettings = () => {
    dispatch(updateAdminProfile({
      adminId: user.uid,
      profileData: {
        name: adminData.name,
        email: adminData.email
      }
    })).then((result) => {
      if (result.type === updateAdminProfile.fulfilled.type) {
        alert('Settings Updated Successfully!');
        setActiveView('dashboard');
      }
    });
  };

  const filteredData = (activeTab === 'users' ? users : doctors).filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative font-sans text-blue-900 overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={bg} alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0"></div>
      </div>

      {/* LOGO */}
      <div className="pt-8 px-4 md:px-10 lg:px-20 max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center z-[1100] w-fit">
          <img src={logo} alt="EmoTrack Logo" className="h-[50px] md:h-[55px]" />
        </Link>
      </div>

      <main className="pt-10 pb-14 px-4 md:px-10 lg:px-20 max-w-[1600px] mx-auto animate-fadeIn">
        
        {/* WELCOME SECTION */}
        <div className="bg-white/40 rounded-[2rem] p-8 mb-10 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#2F357D] flex items-center justify-center font-bold text-white text-3xl shadow-lg border-4 border-white">
              {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-blue">System Control,</p>
              <h1 className="text-4xl font-black text-[#2F357D]">{adminData.name || 'Admin'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-blue font-bold uppercase tracking-tighter">Online & Secure</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveView(activeView === 'settings' ? 'dashboard' : 'settings')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg ${activeView === 'settings' ? 'bg-blue-100 text-blue' : 'bg-[#2F357D] text-white hover:bg-white hover:text-[#2F357D]'}`}
          >
            {activeView === 'settings' ? 'Back to Dashboard' : 'Account Settings'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow lg:w-2/3">
            
            {activeView === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/50 p-6 rounded-[2rem] border border-white shadow-lg flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">👥</div>
                    <div>
                      <p className="text-[10px] font-black text-blue uppercase tracking-widest">Total Users</p>
                      <h4 className="text-2xl font-black text-blue">{loading ? '...' : stats.totalUsers}</h4>
                    </div>
                  </div>
                  <div className="bg-white/10 p-6 rounded-[2rem] border border-white shadow-lg flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">👨‍⚕️</div>
                    <div>
                      <p className="text-[10px] font-black text-blue uppercase tracking-widest">Doctors</p>
                      <h4 className="text-2xl font-black text-blue">{loading ? '...' : stats.totalDoctors}</h4>
                    </div>
                  </div>
                </div>

                {/* TABLE */}
                <div className="bg-white/40 rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-blue-50 bg-white/20 gap-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {setActiveTab('users'); setSearchQuery('')}} 
                        className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'users' ? 'bg-[#2F357D] text-white shadow-md' : 'text-blue hover:bg-blue-50'}`}
                      >
                        Users
                      </button>
                      <button 
                        onClick={() => {setActiveTab('doctors'); setSearchQuery('')}} 
                        className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'doctors' ? 'bg-[#2F357D] text-white shadow-md' : 'text-blue hover:bg-blue-50'}`}
                      >
                        Doctors
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] uppercase font-black text-blue-900/40 border-b border-blue-50">
                          <th className="pb-4 px-4">Details</th>
                          <th className="pb-4 px-4">Status</th>
                          <th className="pb-4 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="3" className="text-center py-6">Loading...</td></tr>
                        ) : filteredData.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-6">No data found</td></tr>
                        ) : (
                          filteredData.map((item) => (
                            <tr key={item.id} className="border-b border-blue-50/50 hover:bg-blue-50/20 transition-all">
                              <td className="py-4 px-4">
                                <div className="font-bold text-sm text-blue">{item.name}</div>
                                <div className="text-[10px] text-blue">{item.email}</div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-600 rounded-lg">{item.status}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button 
                                  onClick={() => handleDelete(item.id)} 
                                  className="text-[10px] font-bold text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeView === 'settings' && (
              <div className="bg-white/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white animate-fadeIn max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-[#2F357D] mb-8 text-center">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-blue-900/60 ml-2 uppercase tracking-widest">Admin Name</label>
                    <input 
                      type="text" 
                      value={adminData.name}
                      onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                      className="w-full mt-1 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-bold text-[#2F357D] focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-900/60 ml-2 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      value={adminData.email}
                      onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                      className="w-full mt-1 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="pt-6 space-y-4">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="w-full py-4 bg-[#2F357D] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>

                   
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-blue-950/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl text-white">
              <h3 className="font-bold mb-6 flex items-center justify-between">
                System Status 
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md animate-pulse">Live</span>
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-blue-200/50 mb-2 uppercase tracking-widest">
                    <span>Server Health</span>
                    <span>{stats.serverHealth}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full w-[99%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-blue-200/50 mb-2 uppercase tracking-widest">
                    <span>Database Load</span>
                    <span>{stats.databaseLoad}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[12%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <button 
        onClick={handleLogout}  
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-600 px-6 py-3 rounded-full font-bold transition-all border border-red-500/20 shadow-2xl group"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
          Logout
        </span>
        <LogOut size={20} />
      </button>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;