import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Common/Header';
import { GuardScannerApp } from './components/GuardModule/GuardScannerApp';
import { StudentPortal } from './components/StudentModule/StudentPortal';
import { AdminDashboard } from './components/AdminModule/AdminDashboard';
import { ThesisView } from './components/ThesisModule/ThesisView';
import { MMUSTLogo } from './components/Common/MMUSTLogo';
import { ShieldCheck, Phone, MapPin, Mail, Globe, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('guard');
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);

  // Trigger state refresh when database changes
  const handleDataChanged = () => {
    setDataVersion((v) => v + 1);
  };

  const handleResetData = () => {
    StorageService.resetAll();
    handleDataChanged();
  };

  // Live counts for Header
  const laptops = StorageService.getLaptops();
  const stolenCount = laptops.filter((l) => l.status === 'Stolen').length;

  const students = StorageService.getStudents();
  const currentStudent = students[0];
  const notifications = StorageService.getNotifications(currentStudent?.reg_no);
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans antialiased selection:bg-[#FAB582] selection:text-[#052642]">
      {/* MMUST Official Navigation Header */}
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        stolenCount={stolenCount}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => {
          setActiveRole('student');
          setShowNotificationsModal(true);
        }}
        onResetData={handleResetData}
      />

      {/* Main View Port */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'guard' && (
          <GuardScannerApp onDataChanged={handleDataChanged} />
        )}

        {activeRole === 'student' && (
          <StudentPortal
            onDataChanged={handleDataChanged}
            openNotificationsModal={showNotificationsModal}
            onCloseNotificationsModal={() => setShowNotificationsModal(false)}
          />
        )}

        {activeRole === 'admin' && (
          <AdminDashboard onDataChanged={handleDataChanged} />
        )}

        {activeRole === 'thesis' && (
          <ThesisView />
        )}
      </main>

      {/* MMUST Official Footer */}
      <footer className="bg-[#042038] text-white border-t-4 border-[#FAB582] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-sky-200/90">
            
            {/* Col 1: University Identity */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-3">
                <MMUSTLogo size="md" lightText={true} />
                <div>
                  <h4 className="font-black text-white text-sm tracking-wide">
                    MASINDE MULIRO UNIVERSITY OF SCIENCE & TECHNOLOGY
                  </h4>
                  <p className="text-[#FAB582] text-[11px] font-semibold italic">
                    "University of Choice" • ISO 9001:2015 Certified
                  </p>
                </div>
              </div>
              <p className="text-sky-100/80 leading-relaxed text-xs max-w-md">
                MMUST Digital Laptop Clearance & Gate Security System replaces slow manual pen-and-paper registers with high-speed QR verification, instantaneous SMS notifications to students, and active gate interception sirens.
              </p>
            </div>

            {/* Col 2: Gate Security Hotlines */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-[#FAB582]">
                Security Gate Checkpoints
              </h5>
              <ul className="space-y-1.5 text-xs text-sky-200">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>Main Gate (Kakamega-Webuye Rd)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>Gate B (Kefinco Student Village)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>Gate C (Administration Complex)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>Pedestrian Walkway Booths</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Emergency */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-[#FAB582]">
                Directorate Hotline
              </h5>
              <div className="space-y-1.5 text-xs text-sky-200">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>Emergency Desk: +254 702 597 360</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>security@mmust.ac.ke</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>P.O. Box 190-50100, Kakamega, Kenya</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#FAB582]" />
                  <span>www.mmust.ac.ke</span>
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-sky-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-sky-300/80">
            <span>
              © {new Date().getFullYear()} Masinde Muliro University of Science and Technology. All Rights Reserved.
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#FAB582]" />
              <span>Security Clearance System v2.4 • Kakamega Main Campus</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
