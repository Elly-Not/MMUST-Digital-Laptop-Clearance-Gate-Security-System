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
      <div className="bg-[#042038] px-3 sm:px-6 py-1.5 text-xs text-sky-200 border-b border-sky-900/80 flex justify-between items-center gap-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2 truncate min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FAB582] animate-pulse shrink-0"></span>
          <span className="font-bold tracking-wider text-[#FAB582] text-[10px] sm:text-xs truncate">
            <span className="sm:hidden">MMUST SECURITY • MAIN CAMPUS</span>
            <span className="hidden sm:inline">MASINDE MULIRO UNIVERSITY OF SCIENCE AND TECHNOLOGY</span>
          </span>
          <span className="text-sky-600 hidden md:inline">•</span>
          <span className="text-sky-200/90 font-medium hidden md:inline text-[11px] truncate">
            Directorate of University Security Services
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-[11px] shrink-0">
          {stolenCount > 0 && (
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm animate-pulse text-[10px] sm:text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>{stolenCount} <span className="hidden sm:inline">Blacklisted</span></span>
            </span>
          )}

          {/* Student Notifications Bell Trigger */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-1 text-sky-200 hover:text-white hover:bg-sky-800/80 rounded-md transition-colors cursor-pointer flex items-center gap-1 min-h-[36px] sm:min-h-0"
              title="Student Gate Clearance Notifications"
              aria-label="View alerts"
            >
              <Bell className="w-4 h-4 text-[#FAB582]" />
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
            className="text-sky-300 hover:text-[#FAB582] flex items-center gap-1 transition-colors cursor-pointer text-[10px] sm:text-xs p-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* MMUST Logo & App Title */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group min-w-0"
            onClick={() => setActiveRole('student')}
            title="Go to MMUST Clearance Portal"
          >
            <MMUSTLogo size="md" />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="font-black text-sm sm:text-lg lg:text-xl tracking-tight text-white flex items-center gap-1 truncate">
                  MMUST <span className="text-[#FAB582]">CLEARANCE</span>
                </h1>
                <span className="hidden lg:inline-block bg-[#007BB6] text-[#FAB582] text-[10px] font-bold px-2 py-0.5 rounded border border-[#FAB582]/40 uppercase tracking-widest shrink-0">
                  Gate Security
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-sky-200/90 font-medium truncate hidden xs:block">
                Digital QR Clearance & Gate Verification
              </p>
            </div>
          </div>

          {/* Module Switcher Buttons (Hidden on mobile <sm, shown in desktop top nav) */}
          <nav className="hidden sm:flex items-center bg-[#042038]/90 p-1 rounded-xl border border-sky-800/60 shadow-inner">
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
              <span className="hidden md:inline">Security Admin</span>
              <span className="md:hidden">Admin</span>
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
