import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import bg from "../assets/bg.jpeg";
import logo from '../assets/LOGO.png';
import api from '../api';
import { logout } from '../store/slices/authSlice';
import {
  HiOutlineUserCircle,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineCalendar
} from 'react-icons/hi';

const defaultAvailability = [
  { day: 'Monday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Tuesday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Wednesday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Thursday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Friday', active: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Saturday', active: false, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Sunday', active: false, slots: [{ start: '09:00', end: '17:00' }] },
];

const appointmentActionConfig = {
  accept: {
    label: 'Accept',
    nextStatus: 'approved',
    message: 'Appointment approved and saved.',
    className: 'bg-[#2F357D] text-white hover:bg-blue-800 shadow-lg'
  },
  reject: {
    label: 'Reject',
    nextStatus: 'rejected',
    message: 'Appointment rejected.',
    className: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
  },
  cancel: {
    label: 'Cancel',
    nextStatus: 'cancelled',
    message: 'Appointment cancelled.',
    className: 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100'
  },
  archive: {
    label: 'Archive',
    nextStatus: 'archived',
    message: 'Appointment archived.',
    className: 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
  },
  restore: {
    label: 'Restore',
    nextStatus: 'pending',
    message: 'Appointment restored.',
    className: 'bg-[#2F357D] text-white hover:bg-blue-800 shadow-lg'
  }
};

const statusStyles = {
  pending: 'bg-blue-50 text-blue-700 border-blue-100',
  approved: 'bg-green-50 text-green-700 border-green-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-100',
  declined: 'bg-red-50 text-red-600 border-red-100',
  cancelled: 'bg-amber-50 text-amber-700 border-amber-100',
  archived: 'bg-slate-100 text-slate-600 border-slate-200'
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  accepted: 'Approved',
  rejected: 'Rejected',
  declined: 'Rejected',
  cancelled: 'Cancelled',
  archived: 'Archived'
};

const getFallbackActions = (status) => {
  if (status === 'pending') return ['accept', 'reject'];
  if (status === 'approved' || status === 'accepted') return ['cancel', 'archive'];
  if (status === 'rejected' || status === 'declined' || status === 'cancelled') return ['archive'];
  if (status === 'archived') return ['restore'];
  return [];
};

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notifications');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [appointmentView, setAppointmentView] = useState('active');

  const [doctorData, setDoctorData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    clinicName: '',
    mobile: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [availableDates, setAvailableDates] = useState([]);

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: <HiOutlineBell /> },
    { id: 'availability', label: 'My Availability', icon: <HiOutlineClock /> },
    { id: 'settings', label: 'Account Settings', icon: <HiOutlineUserCircle /> },
  ];

  const showMessage = (text, isError = false) => {
    setMessage(isError ? '' : text);
    setError(isError ? text : '');
    window.setTimeout(() => {
      setMessage('');
      setError('');
    }, 3500);
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [profileRes, appointmentsRes, availabilityRes] = await Promise.all([
        api.get('/doctor/me'),
        api.get('/doctor/dashboard/appointments?includeArchived=true'),
        api.get('/doctor/availability')
      ]);

      const doctor = profileRes.data.doctor || {};
      setDoctorData({
        name: doctor.name || '',
        email: doctor.email || '',
        password: '',
        specialty: doctor.specialty || '',
        clinicName: doctor.clinicName || '',
        mobile: doctor.mobile || ''
      });
      setAppointments(appointmentsRes.data.appointments || []);
      setAvailability(availabilityRes.data.availability || defaultAvailability);
      setAvailableDates(availabilityRes.data.availableDates || []);
    } catch (err) {
      showMessage(err.response?.data?.error || 'Doctor dashboard load nahi ho saka.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleAppointmentAction = async (id, action) => {
    const config = appointmentActionConfig[action];
    if (!config) return;

    try {
      await api.put(`/doctor/appointments/${id}/status`, { action });

      setAppointments((prev) => {
        if (action === 'archive') {
          return prev.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  status: config.nextStatus,
                  actions: []
                }
              : appt
          );
        }

        return prev.map((appt) =>
          appt.id === id
            ? {
                ...appt,
                status: action === 'restore' ? (appt.previousStatus || config.nextStatus) : config.nextStatus,
                actions: getFallbackActions(action === 'restore' ? (appt.previousStatus || config.nextStatus) : config.nextStatus)
              }
            : appt
        );
      });
      showMessage(config.message);
    } catch (err) {
      showMessage(err.response?.data?.error || 'Appointment update nahi hui.', true);
    }
  };

  const toggleDay = (index) => {
    setAvailability((prev) => prev.map((item, idx) =>
      idx === index ? { ...item, active: !item.active } : item
    ));
  };

  const addSlot = (index) => {
    setAvailability((prev) => prev.map((item, idx) =>
      idx === index
        ? { ...item, slots: [...item.slots, { start: '09:00', end: '17:00' }] }
        : item
    ));
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    setAvailability((prev) => prev.map((item, idx) => {
      if (idx !== dayIndex) return item;
      const slots = item.slots.map((slot, sIdx) =>
        sIdx === slotIndex ? { ...slot, [field]: value } : slot
      );
      return { ...item, slots };
    }));
  };

  const addAvailableDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setAvailableDates((prev) => [
      ...prev,
      { date: today, active: true, slots: [{ start: '09:00', end: '17:00' }] }
    ]);
  };

  const updateAvailableDate = (dateIndex, field, value) => {
    setAvailableDates((prev) => prev.map((item, idx) =>
      idx === dateIndex ? { ...item, [field]: value } : item
    ));
  };

  const updateAvailableDateSlot = (dateIndex, slotIndex, field, value) => {
    setAvailableDates((prev) => prev.map((item, idx) => {
      if (idx !== dateIndex) return item;
      const slots = (item.slots || []).map((slot, sIdx) =>
        sIdx === slotIndex ? { ...slot, [field]: value } : slot
      );
      return { ...item, slots };
    }));
  };

  const addAvailableDateSlot = (dateIndex) => {
    setAvailableDates((prev) => prev.map((item, idx) =>
      idx === dateIndex
        ? { ...item, slots: [...(item.slots || []), { start: '09:00', end: '17:00' }] }
        : item
    ));
  };

  const removeAvailableDate = (dateIndex) => {
    setAvailableDates((prev) => prev.filter((_, idx) => idx !== dateIndex));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        name: doctorData.name,
        specialty: doctorData.specialty,
        clinicName: doctorData.clinicName,
        mobile: doctorData.mobile
      };
      if (doctorData.password.trim()) payload.password = doctorData.password.trim();
      await api.put('/doctor/me', payload);
      setDoctorData((prev) => ({ ...prev, password: '' }));
      showMessage('Profile Firebase me save ho gai.');
    } catch (err) {
      showMessage(err.response?.data?.error || 'Profile save nahi hui.', true);
    } finally {
      setSaving(false);
    }
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      const response = await api.put('/doctor/availability', { availability, availableDates });
      setAvailability(response.data.availability || availability);
      setAvailableDates(response.data.availableDates || availableDates);
      showMessage('Schedule Firebase me publish ho gaya.');
    } catch (err) {
      showMessage(err.response?.data?.error || 'Schedule save nahi hua.', true);
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (doctorData.name || 'Doctor').replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase() || 'D';
  const activeAppointments = appointments.filter((appt) => (appt.status || 'pending').toLowerCase() !== 'archived');
  const archivedAppointments = appointments.filter((appt) => (appt.status || '').toLowerCase() === 'archived');
  const visibleAppointments = appointmentView === 'archived' ? archivedAppointments : activeAppointments;

  return (
    <div className="min-h-screen relative font-sans text-blue-900 overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={bg} alt="bg" className="w-full h-full object-cover" />
      </div>

      <div className="pt-8 px-4 md:px-10 lg:px-20 max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center z-[1100] w-fit">
          <img src={logo} alt="EmoTrack Logo" className="h-[50px] md:h-[55px]" />
        </Link>
      </div>

      <main className="flex-grow pt-15 pb-12 px-[5%]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 sticky top-28">
              <div className="flex flex-col items-center pb-8 border-b border-slate-50">
                <div className="w-20 h-20 rounded-full bg-[#2F357D] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {avatarLetter}
                </div>
                <h2 className="text-[#2F357D] font-bold text-xl text-center">{doctorData.name || 'Doctor'}</h2>
                <p className="text-slate-400 text-sm text-center">{doctorData.specialty || 'Mental Health Professional'}</p>
              </div>

              <nav className="mt-8 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-[#2F357D] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="lg:w-3/4">
            {(message || error) && (
              <div className={`mb-5 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm ${error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {error || message}
              </div>
            )}

            {loading ? (
              <div className="bg-white/80 rounded-[2.5rem] p-10 text-center font-bold text-[#2F357D]">Loading doctor dashboard...</div>
            ) : activeTab === 'notifications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <h3 className="text-xl font-bold text-[#2F357D]">
                    {appointmentView === 'archived' ? 'Archived Appointments' : 'Appointment Requests'}
                  </h3>
                  <div className="flex bg-white border border-blue-100 rounded-2xl p-1 shadow-sm w-full md:w-auto">
                    {[
                      ['active', `Active (${activeAppointments.length})`],
                      ['archived', `Archived (${archivedAppointments.length})`]
                    ].map(([view, label]) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setAppointmentView(view)}
                        className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                          appointmentView === view
                            ? 'bg-[#2F357D] text-white shadow-sm'
                            : 'text-slate-500 hover:bg-blue-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleAppointments.length === 0 ? (
                  <div className="bg-white/80 rounded-[2.5rem] p-10 text-center text-slate-500 font-semibold border border-blue-100">
                    {appointmentView === 'archived' ? 'No archived appointments yet.' : 'No appointment requests yet.'}
                  </div>
                ) : visibleAppointments.map((notif) => {
                  const status = (notif.status || 'pending').toLowerCase();
                  const actions = Array.isArray(notif.actions) && notif.actions.length > 0
                    ? notif.actions
                    : getFallbackActions(status);
                  const visibleActions = actions.filter((action) => !(status === 'pending' && action === 'archive'));

                  return (
                  <div key={notif.id} className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#2F357D] rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <HiOutlineCalendar size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#2F357D]">{notif.patient}</h4>
                        <p className="text-sm text-blue-600 font-semibold">{notif.specialty}</p>
                        <p className="text-xs text-slate-400 font-semibold">{notif.patientEmail}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center items-center">
                      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                        <HiOutlineCalendar size={16} className="text-[#2F357D]" />
                        <span className="text-sm font-bold text-[#2F357D]">{notif.date} - {notif.time}</span>
                      </div>

                      {status !== 'pending' && (
                        <div className={`flex items-center gap-2 px-5 py-2 rounded-xl border ${statusStyles[status] || statusStyles.pending}`}>
                          <span className="text-sm font-bold">{statusLabels[status] || status}</span>
                        </div>
                      )}

                      {visibleActions.map((action) => {
                        const config = appointmentActionConfig[action];
                        if (!config) return null;

                        return (
                          <button
                            key={action}
                            onClick={() => handleAppointmentAction(notif.id, action)}
                            className={`${config.className} px-5 py-2 rounded-xl font-bold text-sm transition-colors active:scale-95`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {!loading && activeTab === 'settings' && (
              <div className="bg-white/80 rounded-[2.5rem] p-8 md:p-6 shadow-2xl border border-white animate-fadeIn max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-[#2F357D] mb-8 text-center">Account Settings</h2>
                <div className="space-y-6">
                  {[
                    ['Full Name', 'name', 'text'],
                    ['Email Address', 'email', 'email'],
                    ['Specialty', 'specialty', 'text'],
                    ['Clinic Name', 'clinicName', 'text'],
                    ['Mobile Number', 'mobile', 'text']
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-blue-900/60 ml-2 uppercase tracking-widest">{label}</label>
                      <input
                        type={type}
                        value={doctorData[key]}
                        disabled={key === 'email'}
                        onChange={(e) => setDoctorData({ ...doctorData, [key]: e.target.value })}
                        className="w-full mt-1 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-bold text-[#2F357D] focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                      />
                    </div>
                  ))}

                  <div className="relative">
                    <label className="text-xs font-bold text-blue-900/60 ml-2 uppercase tracking-widest">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={doctorData.password}
                        placeholder="Leave blank to keep current password"
                        onChange={(e) => setDoctorData({ ...doctorData, password: e.target.value })}
                        className="w-full mt-1 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-bold text-[#2F357D] focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2F357D] text-xs font-black"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    className="w-full py-4 bg-[#2F357D] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
                    disabled={saving}
                    onClick={saveProfile}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {!loading && activeTab === 'availability' && (
              <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-[2.5rem] border border-white shadow-2xl animate-fadeIn">
                <div className="mb-3 text-center md:text-left px-2">
                  <h3 className="text-2xl font-black text-[#2F357D]">Manage Availability</h3>
                </div>

                <div className="bg-white rounded-3xl border border-blue-100 p-4 md:p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Set exact dates and time slots for your patients.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addAvailableDate}
                      className="bg-[#2F357D] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md active:scale-95"
                    >
                      Add Date
                    </button>
                  </div>

                  {availableDates.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-blue-200 p-5 text-center text-sm font-semibold text-slate-400">
                      No dates added yet. Add at least one date so patients can book.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableDates.map((item, dateIndex) => (
                        <div key={`${item.date}-${dateIndex}`} className="rounded-3xl bg-blue-50/60 border border-blue-100 p-4">
                          <div className="flex flex-col lg:flex-row gap-4 lg:items-start justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="checkbox"
                                checked={item.active !== false}
                                onChange={(e) => updateAvailableDate(dateIndex, 'active', e.target.checked)}
                                className="w-5 h-5 accent-[#2F357D]"
                              />
                              <input
                                type="date"
                                value={item.date || ''}
                                onChange={(e) => updateAvailableDate(dateIndex, 'date', e.target.value)}
                                className="px-4 py-3 bg-white border border-blue-100 rounded-2xl font-bold text-[#2F357D] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeAvailableDate(dateIndex)}
                                className="px-4 py-3 bg-red-50 text-red-500 border border-red-100 rounded-2xl text-xs font-black"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="flex flex-col gap-3 items-start lg:items-end">
                              {(item.slots || [{ start: '09:00', end: '17:00' }]).map((slot, slotIndex) => (
                                <div key={`${dateIndex}-${slotIndex}`} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2">
                                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-blue-100">
                                    <input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) => updateAvailableDateSlot(dateIndex, slotIndex, 'start', e.target.value)}
                                      className="w-[100px] px-2 py-2 bg-transparent text-sm font-bold text-[#2F357D] outline-none"
                                    />
                                    <span className="text-slate-400 font-bold text-[10px] uppercase">to</span>
                                    <input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) => updateAvailableDateSlot(dateIndex, slotIndex, 'end', e.target.value)}
                                      className="w-[100px] px-2 py-2 bg-transparent text-sm font-bold text-[#2F357D] outline-none"
                                    />
                                  </div>
                                  {slotIndex === 0 && (
                                    <button
                                      type="button"
                                      onClick={() => addAvailableDateSlot(dateIndex)}
                                      className="w-10 h-10 flex items-center justify-center bg-[#2F357D] text-white rounded-full shadow-md"
                                    >
                                      <span className="text-2xl mt-[-2px]">+</span>
                                    </button>
                                  )}
                                  {slotIndex !== 0 && <div className="w-10 h-10" aria-hidden="true"></div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4 px-2">
                  <button
                    onClick={saveAvailability}
                    disabled={saving}
                    className="w-full sm:w-auto bg-[#2F357D] text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save & Publish Schedule'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <button
        type="button"
        onClick={handleLogout}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-600 px-6 py-3 rounded-full font-bold transition-all border border-red-500/20 shadow-2xl group"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
          Logout
        </span>
        <HiOutlineLogout className="text-xl" />
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
