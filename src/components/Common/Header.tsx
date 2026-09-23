import React from 'react';
import { Laptop, QrCode, FileText, UserCheck, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { UserRole } from '../../types';
import { MMUSTLogo } from './MMUSTLogo';

interface HeaderProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  stolenCount: number;
  unreadNotificationCount: number;
  onOpenNotifications?: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  stolenCount,
  unreadNotificationCount,
  onOpenNotifications,
  onResetData,
}) => {
  return (
    <header className="bg-[#083B66] text-white shadow-xl sticky top-0 z-40 border-b-4 border-[#FAB582]">
      {/* Top University Official Ribbon */}
      <div className="bg-[#042038] px-3 sm:px-6 py-1.5 text-xs text-sky-200 border-b border-sky-900/80 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FAB582] animate-pulse"></span>
          <span className="font-bold tracking-wider text-[#FAB582] text-[11px] sm:text-xs">
            MASINDE MULIRO UNIVERSITY OF SCIENCE AND TECHNOLOGY
          </span>
          <span className="text-sky-600 hidden md:inline">•</span>
          <span className="text-sky-200/90 font-medium hidden md:inline text-[11px]">
            Directorate of University Security Services (Kakamega Main Campus)
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          {stolenCount > 0 && (
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>{stolenCount} Blacklisted Device{stolenCount > 1 ? 's' : ''}</span>
            </span>
          )}

          {/* Student Notifications Bell Trigger */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1 text-sky-200 hover:text-white hover:bg-sky-800/80 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              title="Student Gate Clearance Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-[#FAB582]" />
              <span className="hidden sm:inline text-xs font-semibold">Alerts</span>
              {unreadNotificationCount > 0 && (
                <span className="bg-[#FAB582] text-[#052642] font-black text-[9px] px-1.5 py-0.2 rounded-full">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Reset MMUST database records back to official sample students, registered laptops, and gate logs?')) {
                onResetData();
              }
            }}
            title="Reset system database to fresh MMUST sample test data"
            className="text-sky-300 hover:text-[#FAB582] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3">
          {/* MMUST Logo & App Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveRole('student')}
            title="Go to MMUST Clearance Portal"
          >
            <MMUSTLogo size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-base sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  MMUST <span className="text-[#FAB582]">LAPTOP CLEARANCE</span>
                </h1>
                <span className="hidden lg:inline-block bg-[#007BB6] text-[#FAB582] text-[10px] font-bold px-2 py-0.5 rounded border border-[#FAB582]/40 uppercase tracking-widest">
                  Gate Security
                </span>
              </div>
              <p className="text-[11px] text-sky-200/90 font-medium hidden sm:block">
                Digital QR-Code Clearance, Theft Prevention & Instant Student Notifications
              </p>
            </div>
          </div>

          {/* Module Switcher Buttons */}
          <nav className="flex items-center bg-[#042038]/90 p-1 rounded-xl border border-sky-800/60 shadow-inner">
            <button
              onClick={() => setActiveRole('student')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-[#FAB582] text-[#052642] shadow-md'
                  : 'text-sky-200 hover:text-white hover:bg-sky-900/60'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Student</span>
              {unreadNotificationCount > 0 && activeRole !== 'student' && (
                <span className="w-2 h-2 rounded-full bg-[#FAB582]"></span>
              )}
            </button>

            <button
              onClick={() => setActiveRole('guard')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'guard'
                  ? 'bg-[#FAB582] text-[#052642] shadow-md'
                  : 'text-sky-200 hover:text-white hover:bg-sky-900/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Guard Scanner</span>
            </button>

            <button
              onClick={() => setActiveRole('admin')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-[#FAB582] text-[#052642] shadow-md'
                  : 'text-sky-200 hover:text-white hover:bg-sky-900/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Security Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>

            <button
              onClick={() => setActiveRole('thesis')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeRole === 'thesis'
                  ? 'bg-[#FAB582] text-[#052642] shadow-md'
                  : 'text-sky-200 hover:text-white hover:bg-sky-900/60'
              }`}
              title="Academic Documentation & System Methodology"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Proposal / Thesis</span>
              <span className="md:hidden">Docs</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
