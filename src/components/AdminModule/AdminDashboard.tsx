import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { MMUST_GATES } from '../../data/mockData';
import { MMUSTLogo } from '../Common/MMUSTLogo';
import {
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Users,
  Building,
  LogIn,
  LogOut,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Smartphone,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminDashboardProps {
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onDataChanged }) => {
  const laptops = StorageService.getLaptops();
  const students = StorageService.getStudents();
  const guards = StorageService.getGuards();
  const logs = StorageService.getGateLogs();
  const notifications = StorageService.getNotifications();

  const [gateFilter, setGateFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<'ALL' | 'Entry' | 'Exit' | 'Stolen'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'logs' | 'laptops' | 'stolen' | 'notifications'>('logs');

  // Compute campus-wide occupancy
  let totalInside = 0;
  let totalOutside = 0;
  laptops.forEach((l) => {
    const loc = StorageService.getLaptopCurrentLocation(l.laptop_id);
    if (loc.status === 'Inside') totalInside++;
    else totalOutside++;
  });

  const stolenLaptops = laptops.filter((l) => l.status === 'Stolen');

  // Filter gate logs
  const filteredLogs = logs.filter((log) => {
    const matchGate = gateFilter === 'ALL' || log.gate === gateFilter;
    const matchAction =
      actionFilter === 'ALL'
        ? true
        : actionFilter === 'Stolen'
        ? log.status_at_scan === 'Stolen'
        : log.action === actionFilter;
    const q = searchQuery.trim().toUpperCase();
    const matchQuery =
      !q ||
      log.reg_no.toUpperCase().includes(q) ||
      log.laptop_id.toUpperCase().includes(q) ||
      log.gate.toUpperCase().includes(q) ||
      (log.notes && log.notes.toUpperCase().includes(q));

    return matchGate && matchAction && matchQuery;
  });

  const handleExportCsv = () => {
    const headers = 'Log ID,Date,Timestamp,Gate,Action,Laptop ID,Student Reg No,Guard ID,Status,Notes\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.log_id}","${l.date}","${l.timestamp}","${l.gate}","${l.action}","${l.laptop_id}","${l.reg_no}","${l.guard_id}","${l.status_at_scan}","${l.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MMUST_Gate_Clearance_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleToggleStolen = (laptopId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Stolen' ? 'Active' : 'Stolen';
    const notes = newStatus === 'Stolen' ? 'Flagged stolen by MMUST Security Administrator.' : undefined;
    StorageService.updateLaptopStatus(laptopId, newStatus, notes);
    onDataChanged();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Directorate Header */}
      <div className="bg-gradient-to-r from-[#042038] to-[#083B66] text-white rounded-2xl p-6 shadow-xl border-2 border-[#FAB582] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <MMUSTLogo size="lg" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#FAB582] text-[#052642] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Command Center
              </span>
              <span className="text-xs text-sky-300 font-mono">Kakamega Main Campus</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5">
              Directorate of University Security Services
            </h2>
            <p className="text-xs text-sky-200/90">
              Centralized Gate Security Clearance, Electronic Property Registry & Theft Recovery
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="bg-[#007BB6] hover:bg-[#083B66] text-white border border-[#FAB582]/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#FAB582]" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* University Wide Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Registered Devices */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>REGISTERED LAPTOPS</span>
            <Laptop className="w-4 h-4 text-[#007BB6]" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {laptops.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {students.length} verified students
          </p>
        </div>

        {/* Card 2: Currently Inside Campus */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#007BB6]/60">
          <div className="flex items-center justify-between text-xs text-[#083B66] font-bold mb-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#007BB6] animate-pulse"></span>
              INSIDE CAMPUS
            </span>
            <LogIn className="w-4 h-4 text-[#007BB6]" />
          </div>
          <div className="text-3xl font-black text-[#083B66] font-mono mt-1">
            {totalInside}
          </div>
          <p className="text-[11px] text-[#083B66]/80 mt-1">
            Passed gate entry verification
          </p>
        </div>

        {/* Card 3: Currently Outside Campus */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#FAB582]">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FAB582]"></span>
              OUTSIDE CAMPUS
            </span>
            <LogOut className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-900 font-mono mt-1">
            {totalOutside}
          </div>
          <p className="text-[11px] text-amber-800/80 mt-1">
            Exited or off-campus devices
          </p>
        </div>

        {/* Card 4: Stolen Blacklist */}
        <div className={`rounded-2xl p-4 shadow-sm border-2 ${
          stolenLaptops.length > 0 ? 'bg-red-50 border-red-400' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className={stolenLaptops.length > 0 ? 'text-red-700' : 'text-slate-500'}>
              STOLEN BLACKLIST
            </span>
            <ShieldAlert className={`w-4 h-4 ${stolenLaptops.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-3xl font-black font-mono mt-1 ${stolenLaptops.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stolenLaptops.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stolenLaptops.length > 0 ? 'Gate sirens armed' : 'Zero reported stolen'}
          </p>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-3 sm:px-4 pt-2.5 sm:pt-3 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto -mx-1 px-1">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'logs'
                  ? 'border-[#007BB6] text-[#007BB6] bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Gate Clearance Logs ({logs.length})
            </button>

            <button
              onClick={() => setActiveTab('laptops')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'laptops'
                  ? 'border-[#007BB6] text-[#007BB6] bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Registered Laptops ({laptops.length})
            </button>

            <button
              onClick={() => setActiveTab('stolen')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'stolen'
                  ? 'border-red-600 text-red-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Blacklist Registry ({stolenLaptops.length})
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'notifications'
                  ? 'border-[#007BB6] text-[#007BB6] bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Student SMS/Alerts ({notifications.length})
            </button>
          </div>

          <span className="text-xs text-slate-500 pb-2 hidden md:inline shrink-0">
            MMUST Security Directorate • Active Surveillance
          </span>
        </div>

        {/* Tab 1: Gate Logs */}
        {activeTab === 'logs' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Gate Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Filter By Gate Checkpoint
                </label>
                <select
                  value={gateFilter}
                  onChange={(e) => setGateFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#007BB6]"
                >
                  <option value="ALL">All MMUST Gates</option>
                  {MMUST_GATES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Filter By Action
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#007BB6]"
                >
                  <option value="ALL">All Actions (Entry + Exit)</option>
                  <option value="Entry">Entry Only</option>
                  <option value="Exit">Exit Only</option>
                  <option value="Stolen">Stolen Alerts Only</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Search Reg No / Laptop ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#007BB6]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Log ID / Time</th>
                    <th className="px-3.5 py-2.5">Action</th>
                    <th className="px-3.5 py-2.5">Gate Checkpoint</th>
                    <th className="px-3.5 py-2.5">Student Reg No</th>
                    <th className="px-3.5 py-2.5">Laptop Hardware</th>
                    <th className="px-3.5 py-2.5">Security Officer</th>
                    <th className="px-3.5 py-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No gate clearance logs matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isEntry = log.action === 'Entry';
                      const isStolen = log.status_at_scan === 'Stolen';
                      const laptop = StorageService.getLaptopById(log.laptop_id);
                      const student = StorageService.getStudentByRegNo(log.reg_no);

                      return (
                        <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono">
                            <strong className="text-slate-800">{log.timestamp}</strong>
                            <span className="block text-[10px] text-slate-400">{log.date} • {log.log_id}</span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            {isStolen ? (
                              <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded">
                                STOLEN ALERT
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                                  isEntry
                                    ? 'bg-sky-100 text-[#007BB6]'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {isEntry ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                                {log.action}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-semibold text-slate-700">
                            {log.gate.split('(')[0]}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-mono font-bold text-slate-900">{log.reg_no}</span>
                            {student && <span className="block text-[10px] text-slate-500">{student.name}</span>}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="font-semibold text-slate-800">
                              {laptop ? `${laptop.brand} ${laptop.model}` : log.laptop_id}
                            </span>
                            {laptop && (
                              <span className="block font-mono text-[10px] text-slate-400">
                                S/N: {laptop.serial_no}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-600">
                            {log.guard_id}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500 max-w-xs truncate">
                            {log.notes || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Laptops Master List */}
        {activeTab === 'laptops' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Device ID</th>
                    <th className="px-3.5 py-2.5">Brand & Model</th>
                    <th className="px-3.5 py-2.5">Serial Number</th>
                    <th className="px-3.5 py-2.5">Owner Student</th>
                    <th className="px-3.5 py-2.5">Current Gate Presence</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Blacklist Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laptops.map((l) => {
                    const student = StorageService.getStudentByRegNo(l.reg_no);
                    const loc = StorageService.getLaptopCurrentLocation(l.laptop_id);
                    const isStolen = l.status === 'Stolen';

                    return (
                      <tr key={l.laptop_id} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-800">
                          {l.laptop_id}
                        </td>
                        <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                          {l.brand} {l.model}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#083B66]">
                          {l.serial_no}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-bold text-slate-800">{student?.name || l.reg_no}</span>
                          <span className="block font-mono text-[10px] text-slate-500">{l.reg_no}</span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              loc.status === 'Inside'
                                ? 'bg-sky-100 text-[#007BB6]'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${loc.status === 'Inside' ? 'bg-[#007BB6]' : 'bg-amber-500'}`}></span>
                            {loc.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isStolen ? 'bg-red-600 text-white' : 'bg-sky-100 text-[#007BB6]'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <button
                            onClick={() => handleToggleStolen(l.laptop_id, l.status)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              isStolen
                                ? 'bg-[#007BB6] hover:bg-[#083B66] text-white'
                                : 'bg-red-100 hover:bg-red-200 text-red-700'
                            }`}
                          >
                            {isStolen ? 'Reinstate Clearance' : 'Flag as Stolen'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Stolen Blacklist */}
        {activeTab === 'stolen' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-950 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-sm text-red-800 block">
                  Active Stolen Device Blacklist Protocol
                </strong>
                Any device listed here is strictly blocked across all MMUST campus gates. Scanning triggers an emergency audible siren and red detention prompt on the guard scanner.
              </div>
            </div>

            {stolenLaptops.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No laptops currently blacklisted as stolen.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stolenLaptops.map((l) => {
                  const student = StorageService.getStudentByRegNo(l.reg_no);
                  return (
                    <div key={l.laptop_id} className="bg-red-50/40 rounded-xl p-4 border-2 border-red-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          BLACKLIST ACTIVE
                        </span>
                        <span className="font-mono text-xs text-slate-500">{l.laptop_id}</span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{l.brand} {l.model}</h4>
                        <p className="font-mono text-xs text-red-800 font-bold">Serial No: {l.serial_no}</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-red-200 text-xs text-slate-700">
                        <strong className="text-red-700 block">Incident Report:</strong>
                        <p className="text-[11px] text-slate-600">{l.stolen_notes}</p>
                        {student && (
                          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1">
                            Owner: <strong>{student.name}</strong> • Phone: {student.phone}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleStolen(l.laptop_id, l.status)}
                        className="w-full bg-[#007BB6] hover:bg-[#083B66] text-white py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reinstate Clearance (Recovered)
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Student Notifications Audit Stream */}
        {activeTab === 'notifications' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-[#007BB6]" />
                Automated Student Dispatch Audit Log ({notifications.length} Sent)
              </span>
              <span className="text-[11px] text-[#083B66] bg-sky-50 px-2 py-0.5 rounded font-mono font-semibold">
                SMS Gateway: Active
              </span>
            </div>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 max-h-[500px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 hover:bg-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#007BB6]" />
                      {n.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {n.timestamp} • {n.date}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 text-xs">{n.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">Recipient: {n.recipient_phone}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded">Student: {n.reg_no}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded">Gate: {n.gate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
