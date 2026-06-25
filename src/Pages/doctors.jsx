import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import bg from '../assets/bg.jpeg';
import Doctor from "../assets/doctor.png";
import api from '../api';
import {
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineLocationMarker
} from 'react-icons/hi';

const fallbackSlots = ['10:00 AM - 11:00 AM', '12:00 PM - 01:00 PM', '04:00 PM - 05:00 PM']
  .map((slot) => ({ label: slot, value: slot, booked: false }));

const getSlotLabel = (slot) => {
  if (typeof slot === 'string') return slot;
  return slot.label || slot.timeSlot || `${slot.start} - ${slot.end}`;
};

const normalizeClockTime = (value) => {
  const match = String(value || '').trim().toUpperCase().replaceAll('.', '').match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/);
  if (!match) return String(value || '').trim();

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3];
  if (meridiem === 'AM' && hour === 12) hour = 0;
  if (meridiem === 'PM' && hour !== 12) hour += 12;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const normalizeSlotValue = (slot) => {
  const label = getSlotLabel(slot).replace(/\s*-\s*/, ' - ');
  const parts = label.split(' - ');
  if (parts.length !== 2) return label;
  return `${normalizeClockTime(parts[0])} - ${normalizeClockTime(parts[1])}`;
};

const toSlotOption = (slot) => {
  const label = getSlotLabel(slot);
  return {
    label,
    value: normalizeSlotValue(slot),
    booked: Boolean(slot.booked || slot.status === 'booked')
  };
};

const cardAccents = [
  { chip: 'bg-blue-50 text-blue-700', bar: 'bg-[#2F357D]', ring: 'ring-blue-100', soft: 'bg-blue-50' },
  { chip: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-600', ring: 'ring-emerald-100', soft: 'bg-emerald-50' },
  { chip: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500', ring: 'ring-rose-100', soft: 'bg-rose-50' },
  { chip: 'bg-cyan-50 text-cyan-700', bar: 'bg-cyan-600', ring: 'ring-cyan-100', soft: 'bg-cyan-50' }
];

const getDoctorInitials = (name = 'Doctor') => {
  const cleanName = name.replace(/^Dr\.\s*/i, '').trim();
  return cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'DR';
};

const getAvailableSlotCount = (doctor) => {
  return (doctor?.availableDates || []).reduce((count, item) => {
    return count + (item.slots || []).filter((slot) => !slot.booked).length;
  }, 0);
};

const getWhatsAppNumber = (phone = '') => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
};

const Doctors = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: '', timeSlot: '', email: '' });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctor/list');
        setDoctors(response.data.doctors || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Doctors load nahi ho sakay.');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  const availableDates = useMemo(() => selectedDoctor?.availableDates || [], [selectedDoctor]);
  const selectedDate = form.date || availableDates[0]?.date || '';

  const timeSlots = useMemo(() => {
    if (!selectedDoctor) return fallbackSlots;
    if (availableDates.length === 0) return [];

    const exactDate = availableDates.find((item) => item.date === selectedDate);
    const exactSlots = (exactDate?.slots || []).map(toSlotOption);
    if (exactDate) return exactSlots;

    const dayName = selectedDate
      ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
      : '';
    const dayAvailability = (selectedDoctor.availability || []).find(
      (item) => item.active && item.day === dayName
    );
    const slots = (dayAvailability?.slots || []).map(toSlotOption);

    return slots.length ? slots : fallbackSlots;
  }, [selectedDoctor, selectedDate, availableDates]);

  const availableTimeSlots = useMemo(
    () => timeSlots.filter((slot) => !slot.booked),
    [timeSlots]
  );
  const selectedSlotValue = form.timeSlot || availableTimeSlots[0]?.value || '';

  const handleConsultClick = (doctor) => {
    setSelectedDoctor(doctor);
    setForm({ date: '', timeSlot: '', email: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!selectedDoctor?.uid) {
      setError('Doctor select nahi hua.');
      return;
    }
    if (!selectedSlotValue) {
      setError('Is date par koi available slot nahi hai.');
      return;
    }

    try {
      setBooking(true);
      await api.post('/doctor/appointments', {
        doctorId: selectedDoctor.uid,
        date: selectedDate,
        timeSlot: selectedSlotValue,
        email: form.email
      });
      const response = await api.get('/doctor/list');
      setDoctors(response.data.doctors || []);
      setIsModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking save nahi hui. Login karke dobara try karein.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <div className="fixed inset-0 z-[-10] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bg})` }}>
        <div className="absolute inset-0 bg-blue-50/20 backdrop-blur-[2px]"></div>
      </div>

      <Navbar />

      <main className="flex-grow pt-36 pb-20 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 px-4">
            <h3 className="text-3xl font-black text-[#2F357D] tracking-tight uppercase">Certified Professionals</h3>
            <div className="w-24 h-2 bg-[#2F357D] rounded-full mt-2 shadow-lg shadow-blue-200"></div>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-3 font-bold text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white/80 rounded-[40px] p-10 text-center font-bold text-[#2F357D]">
              Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white/80 rounded-[40px] p-10 text-center font-bold text-slate-500">
              No doctors available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {doctors.map((doc, index) => {
                const accent = cardAccents[index % cardAccents.length];
                const hasOpenSlots = getAvailableSlotCount(doc) > 0;
                const whatsappNumber = getWhatsAppNumber(doc.phone);

                return (
                  <div key={doc.uid} className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/80 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                    <div className={`h-2 ${accent.bar}`}></div>
                    <div className="relative px-6 pt-6">
                      <div className={`absolute right-5 top-5 ${accent.chip} rounded-full px-3 py-1 text-[10px] font-black uppercase`}>
                        {hasOpenSlots ? 'Available' : 'Booked'}
                      </div>
                      <div className={`${accent.soft} rounded-3xl h-44 flex items-end justify-center overflow-hidden ring-1 ${accent.ring}`}>
                        <img src={Doctor} alt={doc.name} className="h-full w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="absolute left-10 bottom-[-22px] w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                        <span className="text-[#2F357D] font-black text-lg">{getDoctorInitials(doc.name)}</span>
                      </div>
                    </div>

                    <div className="px-6 pt-10 pb-6 flex flex-col flex-grow">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-left">
                            <h4 className="font-black text-[#2F357D] text-2xl leading-tight">{doc.name}</h4>
                            <p className={`mt-2 inline-flex items-center gap-1 ${accent.chip} text-[10px] font-black uppercase px-3 py-1 rounded-full`}>
                              <HiOutlineCheckCircle className="text-sm" />
                              {doc.role}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-slate-500 leading-relaxed font-medium text-left line-clamp-2">{doc.desc}</p>
                      </div>

                      <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2">
                        <div className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                          <HiOutlineLocationMarker className="text-[#2F357D] shrink-0" />
                          <span>{doc.clinicName || 'Clinic not provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                          <HiOutlinePhone className="text-[#2F357D] shrink-0" />
                          <span>{doc.phone || 'Phone not provided'}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 flex gap-3">
                        {whatsappNumber && (
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 border border-green-100 bg-green-50 text-green-700 text-[11px] font-black py-4 rounded-2xl text-center hover:bg-green-100 transition-colors uppercase"
                          >
                            WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => handleConsultClick(doc)}
                          disabled={!hasOpenSlots}
                          className="flex-[1.4] bg-[#2F357D] hover:bg-indigo-900 text-white text-[11px] font-black py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain p-4 pt-20 sm:pt-23">
          <div className="absolute inset-0 bg-[#2F357D]/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-3xl bg-white/95 p-5 shadow-2xl border border-white backdrop-blur-3xl animate-in fade-in zoom-in duration-300 sm:p-6">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-5 top-4 text-[#2F357D] font-bold text-lg leading-none">x</button>
            <h2 className="text-xl font-black text-[#2F357D] mb-1 pr-8">Book Appointment</h2>
            <p className="text-xs text-blue-600 font-bold mb-4">with {selectedDoctor?.name}</p>
            <form className="space-y-4" onSubmit={handleConfirmBooking}>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#2F357D]/60 mb-1.5 ml-1">Select Date</label>
                <select
                  required
                  value={selectedDate}
                  onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })}
                  className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 ring-blue-400/50 text-[#2F357D] text-sm font-medium"
                >
                  {availableDates.length === 0 ? (
                    <option value="">No available dates</option>
                  ) : availableDates.map((item) => (
                    <option key={item.date} value={item.date}>
                      {item.label} ({item.day})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#2F357D]/60 mb-1.5 ml-1">Select Time Slot</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {timeSlots.map((slot) => {
                    const selected = selectedSlotValue === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        disabled={slot.booked}
                        onClick={() => setForm({ ...form, timeSlot: slot.value })}
                        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all ${
                          slot.booked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : selected
                              ? 'bg-[#2F357D] text-white border-[#2F357D] shadow-md'
                              : 'bg-white text-[#2F357D] border-blue-100 hover:border-[#2F357D]'
                        }`}
                      >
                        <span className="min-w-0 truncate">{slot.label}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                          slot.booked
                            ? 'bg-white text-red-500 border border-red-100'
                            : selected
                              ? 'bg-white/20 text-white'
                              : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {slot.booked ? 'Booked' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                  {timeSlots.length === 0 && (
                    <div className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 text-[#2F357D] text-sm font-medium">
                      No slots available
                    </div>
                  )}
                  {timeSlots.length > 0 && availableTimeSlots.length === 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-bold text-red-600">
                      All slots are booked for this date.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#2F357D]/60 mb-1.5 ml-1">Your Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@mail.com"
                  className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 ring-blue-400/50 text-[#2F357D] text-sm font-medium"
                />
              </div>
              <button disabled={booking || availableDates.length === 0 || availableTimeSlots.length === 0} type="submit" className="w-full bg-[#2F357D] text-white text-sm font-black py-3 rounded-xl shadow-lg hover:bg-blue-800 transition-all mt-2 disabled:opacity-60">
                {booking ? 'SAVING...' : 'CONFIRM BOOKING'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm bg-white/95 backdrop-blur-xl border border-green-200 p-6 rounded-[30px] shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">OK</div>
          <h3 className="font-black text-[#2F357D] text-xl">Booking Requested!</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Appointment Firebase me save ho gai hai.</p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Doctors;
