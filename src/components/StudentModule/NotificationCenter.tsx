import React from 'react';
import { StudentNotification, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { Bell, CheckCheck, Clock, ShieldCheck, ShieldAlert, LogIn, LogOut, Smartphone, Mail, X } from 'lucide-react';

interface NotificationCenterProps {
  student: Student;
  notifications: StudentNotification[];
  onClose?: () => void;
  onRefresh: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  student,
  notifications,
  onClose,
  onRefresh,
}) => {
  const studentNotifications = notifications.filter(
    (n) => n.reg_no.toUpperCase() === student.reg_no.toUpperCase()
  );

  const unreadCount = studentNotifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead(student.reg_no);
    onRefresh();
  };

  const handleItemClick = (notif: StudentNotification) => {
    if (!notif.read) {
      StorageService.markNotificationAsRead(notif.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#042038] to-[#083B66] text-white px-3.5 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-sky-900 gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAB582]/20 border border-[#FAB582]/40 flex items-center justify-center text-[#FAB582] shrink-0">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">Student Gate Alerts</h3>
              {unreadCount > 0 && (
                <span className="bg-[#FAB582] text-[#052642] text-[10px] sm:text-xs font-black px-1.5 py-0.2 rounded-full shrink-0">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-sky-200/90 truncate">
              Live automated SMS & portal notifications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-[#FAB582] hover:text-white hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Mark all read</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-sky-200 hover:text-white p-1 rounded-lg hover:bg-sky-900/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Recipient Contact Status Bar */}
      <div className="bg-sky-50/70 border-b border-sky-100 px-3.5 sm:px-5 py-2 sm:py-2.5 flex flex-wrap items-center justify-between text-xs text-[#083B66] gap-1.5">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-[#007BB6]" />
            SMS to: <strong className="font-mono">{student.phone}</strong>
          </span>
          <span className="flex items-center gap-1 font-medium hidden sm:flex">
            <Mail className="w-3.5 h-3.5 text-[#007BB6]" />
            Email: <strong className="font-mono">{student.email}</strong>
          </span>
        </div>
        <span className="text-[11px] bg-sky-200/60 text-[#083B66] px-2 py-0.5 rounded font-semibold">
          Auto-Dispatch Active
        </span>
      </div>

      {/* Notifications List */}
      <div className="p-4 divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {studentNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-600">No gate clearance notifications yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              As soon as security officers scan your laptop at MMUST Main Gate, Gate B, or Gate C, notifications will appear here.
            </p>
          </div>
        ) : (
          studentNotifications.map((notif) => {
            const isEntry = notif.action === 'Entry';
            const isExit = notif.action === 'Exit';
            const isAlert = notif.action === 'Stolen Alert';

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer ${
                  !notif.read ? 'bg-amber-50/50 border-l-4 border-[#FAB582]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Action Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isAlert
                        ? 'bg-red-100 text-red-600 border border-red-200'
                        : isEntry
                        ? 'bg-sky-100 text-[#007BB6] border border-sky-200'
                        : isExit
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-sky-100 text-[#007BB6] border border-sky-200'
                    }`}
                  >
                    {isAlert ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isEntry ? (
                      <LogIn className="w-5 h-5" />
                    ) : isExit ? (
                      <LogOut className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isAlert ? 'text-red-700' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <div className="flex items-center space-x-1.5 shrink-0 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{notif.timestamp}</span>
                        <span>•</span>
                        <span>{notif.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadata chips */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Gate: {notif.gate}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                        Device: {notif.laptop_summary}
                      </span>
                      {notif.sms_sent && (
                        <span className="bg-sky-50 text-[#007BB6] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5" /> SMS Delivered
                        </span>
                      )}
                      {!notif.read && (
                        <span className="bg-[#FAB582]/40 text-[#083B66] font-bold px-1.5 py-0.5 rounded">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
