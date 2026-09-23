import React, { useState } from 'react';
import { Student, Laptop, StudentNotification } from '../../types';
import { StorageService } from '../../services/storage';
import { PrintableGatePass } from './PrintableGatePass';
import { RegisterLaptopModal } from './RegisterLaptopModal';
import { ReportStolenModal } from './ReportStolenModal';
import { NotificationCenter } from './NotificationCenter';
import { MMUSTLogo } from '../Common/MMUSTLogo';
import {
  Laptop as LaptopIcon,
  PlusCircle,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Clock,
  LogIn,
  LogOut,
  Building,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface StudentPortalProps {
  onDataChanged: () => void;
  openNotificationsModal?: boolean;
  onCloseNotificationsModal?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onDataChanged,
  openNotificationsModal = false,
  onCloseNotificationsModal,
}) => {
  const students = StorageService.getStudents();
  const [selectedRegNo, setSelectedRegNo] = useState<string>(students[0]?.reg_no || 'BIT/0042/2022');
  const currentStudent = StorageService.getStudentByRegNo(selectedRegNo) || students[0];

  // State for modals
  const [selectedLaptopForPass, setSelectedLaptopForPass] = useState<Laptop | null>(null);
  const [selectedLaptopForStolen, setSelectedLaptopForStolen] = useState<Laptop | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(openNotificationsModal);

  const studentLaptops = StorageService.getLaptopsByRegNo(currentStudent.reg_no);
  const studentNotifications = StorageService.getNotifications(currentStudent.reg_no);
  const unreadCount = studentNotifications.filter((n) => !n.read).length;
  const recentGateLogs = StorageService.getGateLogs().filter((l) => l.reg_no === currentStudent.reg_no);

  const handleLaptopRegistered = (newLaptop: Laptop) => {
    setShowRegisterModal(false);
    setSelectedLaptopForPass(newLaptop);
    onDataChanged();
  };

  const handleStatusUpdated = (updated: Laptop) => {
    setSelectedLaptopForStolen(null);
    onDataChanged();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Student Switcher / Profile Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Student Profile Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentStudent.photo}
                alt={currentStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#007BB6] shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#007BB6] border-2 border-white flex items-center justify-center text-[#FAB582]">
                <ShieldCheck className="w-3 h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">{currentStudent.name}</h2>
                <span className="bg-[#007BB6] text-[#FAB582] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {currentStudent.reg_no}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{currentStudent.course}</p>
              <p className="text-[11px] text-slate-400">{currentStudent.faculty} • {currentStudent.year_of_study}</p>
            </div>
          </div>

          {/* Quick Controls: Switch Student & Notification Alert Trigger */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Switch Active Student Account */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="student-select" className="text-slate-500 text-[11px] shrink-0">Student:</label>
              <select
                id="student-select"
                value={selectedRegNo}
                onChange={(e) => setSelectedRegNo(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer truncate flex-1 min-w-0"
              >
                {students.map((s) => (
                  <option key={s.reg_no} value={s.reg_no}>
                    {s.name} ({s.reg_no})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Button */}
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="relative bg-sky-50 hover:bg-sky-100 text-[#083B66] border border-sky-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[44px]"
              >
                <Bell className="w-3.5 h-3.5 text-[#007BB6]" />
                <span>Gate Alerts</span>
                {unreadCount > 0 && (
                  <span className="bg-[#FAB582] text-[#052642] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Register New Laptop Button */}
              <button
                onClick={() => setShowRegisterModal(true)}
                className="bg-[#007BB6] hover:bg-[#083B66] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer flex-1 sm:flex-initial min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 text-[#FAB582]" />
                <span>Register Laptop</span>
              </button>
            </div>
          </div>

        </div>

        {/* Most Recent Gate Status Notification Banner (if any) */}
        {studentNotifications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 text-xs text-amber-950">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#007BB6] animate-ping"></span>
              <span>
                <strong>Latest Gate Alert:</strong> {studentNotifications[0].message}
              </span>
            </div>
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className="text-[#007BB6] font-bold hover:underline shrink-0 text-[11px] ml-2 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Laptops vs Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Registered Laptops Cards (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LaptopIcon className="w-5 h-5 text-[#007BB6]" />
              <h3 className="font-bold text-base text-slate-800">
                My Registered Electronic Devices ({studentLaptops.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Pass valid at all MMUST gates
            </span>
          </div>

          {studentLaptops.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <LaptopIcon className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 text-base">No Laptops Registered Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Register your personal laptop with its model, serial number, and photo to generate your official MMUST Gate Pass QR Sticker.
              </p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="bg-[#007BB6] hover:bg-[#083B66] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-[#FAB582]" />
                <span>Register Laptop Now</span>
              </button>
            </div>
          ) : (
            studentLaptops.map((laptop) => {
              const location = StorageService.getLaptopCurrentLocation(laptop.laptop_id);
              const isStolen = laptop.status === 'Stolen';

              return (
                <div
                  key={laptop.laptop_id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                    isStolen
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    {/* Device Thumbnail & Names */}
                    <div className="flex items-center space-x-3.5">
                      <div className="w-16 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img
                          src={laptop.photo}
                          alt={laptop.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900">
                            {laptop.brand} {laptop.model}
                          </h4>
                          {isStolen ? (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              STOLEN BLACKLISTED
                            </span>
                          ) : (
                            <span className="bg-sky-100 text-[#007BB6] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#007BB6]" />
                              VERIFIED ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          ID: <span className="font-bold text-slate-700">{laptop.laptop_id}</span> • S/N:{' '}
                          <span className="font-bold bg-[#FAB582]/30 text-[#052642] px-1 py-0.2 rounded">
                            {laptop.serial_no}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Current Gate Campus Presence Indicator */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Gate Presence Status
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          location.status === 'Inside'
                            ? 'bg-sky-100 text-[#083B66] border border-sky-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            location.status === 'Inside' ? 'bg-[#007BB6] animate-pulse' : 'bg-amber-500'
                          }`}
                        />
                        {location.status === 'Inside' ? 'Currently On Campus (Inside)' : 'Currently Off Campus (Outside)'}
                      </span>
                      {location.lastLog && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Last at {location.lastLog.gate.split('(')[0]} ({location.lastLog.timestamp})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stolen Case Notes if Flagged */}
                  {isStolen && laptop.stolen_notes && (
                    <div className="mt-3 bg-red-50 border border-red-300 rounded-xl p-3 text-xs text-red-900 flex items-start space-x-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Lockdown Case Active:</strong>
                        <span>{laptop.stolen_notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Registered on {laptop.registered_at.split(' ')[0]}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* View & Print Gate Pass */}
                      <button
                        onClick={() => setSelectedLaptopForPass(laptop)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[40px]"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#007BB6]" />
                        <span>View / Print Pass</span>
                      </button>

                      {/* Report Stolen or Unblock */}
                      <button
                        onClick={() => setSelectedLaptopForStolen(laptop)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[40px] ${
                          isStolen
                            ? 'bg-[#007BB6] hover:bg-[#083B66] text-white'
                            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{isStolen ? 'Mark Recovered' : 'Report Stolen'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Student Gate Scan Activity History */}
          {recentGateLogs.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#007BB6]" />
                <span>Recent Clearance Gate Passes for My Laptops</span>
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {recentGateLogs.slice(0, 5).map((log) => {
                  const isEntry = log.action === 'Entry';
                  return (
                    <div key={log.log_id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            isEntry ? 'bg-sky-100 text-[#007BB6]' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isEntry ? 'IN' : 'OUT'}
                        </span>
                        <div>
                          <strong className="text-slate-800">{log.action} at {log.gate}</strong>
                          <p className="text-[11px] text-slate-400">Pass: {log.laptop_id}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 font-mono">
                        <div>{log.timestamp}</div>
                        <div>{log.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Notification Center / Inbox (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <NotificationCenter
            student={currentStudent}
            notifications={studentNotifications}
            onRefresh={onDataChanged}
          />
        </div>

      </div>

      {/* Modals */}
      {selectedLaptopForPass && (
        <PrintableGatePass
          laptop={selectedLaptopForPass}
          student={currentStudent}
          onClose={() => setSelectedLaptopForPass(null)}
        />
      )}

      {selectedLaptopForStolen && (
        <ReportStolenModal
          laptop={selectedLaptopForStolen}
          student={currentStudent}
          onClose={() => setSelectedLaptopForStolen(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {showRegisterModal && (
        <RegisterLaptopModal
          student={currentStudent}
          onClose={() => setShowRegisterModal(false)}
          onRegistered={handleLaptopRegistered}
        />
      )}
    </div>
  );
};
