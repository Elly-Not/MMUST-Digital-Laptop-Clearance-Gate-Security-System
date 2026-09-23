import React, { useState } from 'react';
import { Laptop, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { AlertTriangle, ShieldAlert, X, PhoneCall, CheckCircle } from 'lucide-react';

interface ReportStolenModalProps {
  laptop: Laptop;
  student: Student;
  onClose: () => void;
  onStatusUpdated: (updated: Laptop) => void;
}

export const ReportStolenModal: React.FC<ReportStolenModalProps> = ({
  laptop,
  student,
  onClose,
  onStatusUpdated,
}) => {
  const isCurrentlyStolen = laptop.status === 'Stolen';
  const [location, setLocation] = useState('MMUST Main Library');
  const [incidentTime, setIncidentTime] = useState('Today around 3:00 PM');
  const [notes, setNotes] = useState('');
  const [confirmLock, setConfirmLock] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCurrentlyStolen) {
      // Mark as recovered
      const updated = StorageService.updateLaptopStatus(laptop.laptop_id, 'Active');
      if (updated) onStatusUpdated(updated);
      return;
    }

    if (!confirmLock) {
      alert('Please check the confirmation box to authorize immediate gate lockdown.');
      return;
    }

    const fullNotes = `REPORTED STOLEN: Location: ${location}. Time: ${incidentTime}. Details: ${notes || 'No extra notes provided by student.'} Reported by student ${student.name} (${student.reg_no}, ${student.phone}).`;

    const updated = StorageService.updateLaptopStatus(laptop.laptop_id, 'Stolen', fullNotes);
    if (updated) {
      onStatusUpdated(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-red-500 overflow-hidden my-6">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${isCurrentlyStolen ? 'bg-[#083B66]' : 'bg-red-700'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isCurrentlyStolen ? (
                <CheckCircle className="w-6 h-6 text-[#FAB582]" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-300 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isCurrentlyStolen ? 'Device Recovery & Clearance Reinstatement' : 'EMERGENCY: Report Laptop as Stolen'}
              </h3>
              <p className="text-xs text-white/80">
                MMUST Security Command Network Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Laptop Info Summary */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Device: </span>
            <strong className="text-slate-900 font-semibold">{laptop.brand} {laptop.model}</strong>
          </div>
          <div className="font-mono text-slate-700">
            S/N: <strong className="text-red-700 bg-red-100 px-1.5 py-0.5 rounded">{laptop.serial_no}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isCurrentlyStolen ? (
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-300 rounded-xl p-4 text-[#083B66] text-xs leading-relaxed">
                <p className="font-bold text-sm text-[#083B66] mb-1">
                  Has your stolen laptop been recovered?
                </p>
                Clearing the stolen alert will unblock the device across all MMUST gate scanners (Main Gate, Gate B, Gate C) and permit normal student exit/entry clearance again.
              </div>
              <p className="text-xs text-slate-500 italic">
                Current incident notes: {laptop.stolen_notes}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-950 text-xs flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong>Immediate Gate Lockdown:</strong> Once you submit this report, any security guard who scans this laptop's QR code at <em>any</em> university gate will immediately see a <strong>flashing RED alert screen with an alarm siren</strong> to detain the person carrying your laptop.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Last Known Location on / off Campus *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  <option value="MMUST Main Library (Kakamega)">MMUST Main Library</option>
                  <option value="School of Computing Labs (SCI)">School of Computing Labs (SCI)</option>
                  <option value="Hall of Residence 1 / 2 / 3 / 4">Hall of Residence (Hostels)</option>
                  <option value="Science Complex Lecture Theatres">Science Complex Lecture Theatres</option>
                  <option value="Engineering Workshops">Engineering Workshops</option>
                  <option value="Student Cafeteria / Mess">Student Cafeteria / Mess</option>
                  <option value="Kefinco Off-Campus Hostels">Kefinco Off-Campus Hostels</option>
                  <option value="Lurambi / Kakamega Town">Lurambi / Kakamega Town</option>
                  <option value="Other">Other Campus Area</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Date & Time of Disappearance *
                </label>
                <input
                  type="text"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  placeholder="e.g. Today around 2:30 PM during lecture"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Description & Suspect Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe laptop bag, stickers, or circumstances..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmLock}
                    onChange={(e) => setConfirmLock(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    I confirm this report is truthful and request MMUST Security to flag this device ID ({laptop.laptop_id}) on all gate scanners.
                  </span>
                </label>
              </div>

              {/* Direct Campus Security Hotline Banner */}
              <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4 text-amber-700" />
                  <span>MMUST Security Hotline:</span>
                </div>
                <a href="tel:+254700000000" className="font-mono font-bold text-amber-800 hover:underline">
                  +254 (056) 2030146 / 0722-112233
                </a>
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                isCurrentlyStolen
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-red-600 hover:bg-red-700 animate-pulse'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isCurrentlyStolen ? 'Unblock & Mark Recovered' : 'Activate Campus Gate Blacklist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
