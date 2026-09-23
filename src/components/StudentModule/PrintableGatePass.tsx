import React, { useEffect, useState } from 'react';
import { Laptop, Student } from '../../types';
import { generateQrDataUrl } from '../../utils/qr';
import { Printer, Download, ShieldCheck, AlertCircle, X, CheckCircle2, QrCode } from 'lucide-react';
import { MMUSTLogo } from '../Common/MMUSTLogo';

interface PrintableGatePassProps {
  laptop: Laptop;
  student: Student;
  onClose: () => void;
}

export const PrintableGatePass: React.FC<PrintableGatePassProps> = ({
  laptop,
  student,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    generateQrDataUrl(laptop.qr_data).then(setQrDataUrl);
  }, [laptop.qr_data]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `MMUST-QR-${laptop.serial_no}.png`;
    a.click();
  };

  const isStolen = laptop.status === 'Stolen';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Controls Bar (hidden during printing) */}
        <div className="print:hidden bg-[#042038] text-white px-6 py-4 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#FAB582]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Official MMUST Digital Laptop Clearance Pass</h3>
              <p className="text-xs text-sky-200">Generate, Print & Stick on Laptop Bottom Shell or Keep on Phone</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-[#007BB6] hover:bg-[#083B66] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Print clearance sticker card"
            >
              <Printer className="w-4 h-4 text-[#FAB582]" />
              <span>Print Sticker</span>
            </button>
            <button
              onClick={handleDownloadQr}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download QR code image file"
            >
              <Download className="w-4 h-4" />
              <span>Save QR</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 bg-slate-50 printable-area">
          {/* Main Card Border with University Security Pattern */}
          <div className={`relative bg-white rounded-xl border-2 ${isStolen ? 'border-red-500' : 'border-[#007BB6]'} p-6 shadow-sm overflow-hidden`}>
            
            {/* Watermark Crest Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
              <ShieldCheck className="w-96 h-96 text-[#083B66]" />
            </div>

            {/* University Header */}
            <div className="border-b-2 border-[#007BB6]/80 pb-4 mb-5 text-center relative">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <MMUSTLogo size="sm" />
                <span className="bg-[#083B66] text-[#FAB582] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  MASINDE MULIRO UNIVERSITY OF SCIENCE AND TECHNOLOGY
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#083B66] uppercase tracking-tight">
                DIRECTORATE OF UNIVERSITY SECURITY SERVICES
              </h2>
              <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Digital Laptop Gate Clearance & Electronic Property Pass
              </p>
              
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-mono">
                <span>PASS ID: <strong>{laptop.laptop_id}</strong></span>
                <span>•</span>
                <span>REG DATE: <strong>{laptop.registered_at.split(' ')[0]}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold">
                  STATUS:{' '}
                  {isStolen ? (
                    <span className="text-red-600 bg-red-100 px-1.5 py-0.2 rounded font-sans">
                      REPORTED STOLEN
                    </span>
                  ) : (
                    <span className="text-[#007BB6] bg-sky-100 px-1.5 py-0.2 rounded font-sans font-bold">
                      ACTIVE & VERIFIED
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Main Content Grid: QR Code + Details */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: QR Code + Scan Instruction */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div className="relative bg-white p-2.5 rounded-lg border-2 border-[#007BB6] shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${laptop.serial_no}`}
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12 animate-spin" />
                    </div>
                  )}
                  {/* Miniature center logo simulation */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 rounded bg-[#083B66] border border-[#FAB582] flex items-center justify-center text-[#FAB582] text-[9px] font-black shadow-sm">
                      M
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-[10px] text-slate-500 font-mono tracking-wider break-all max-w-[200px]">
                  {laptop.serial_no}
                </p>
                <span className="mt-1 text-[11px] text-[#083B66] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007BB6]" />
                  Instant Guard 2s Scan Pass
                </span>
              </div>

              {/* Right Column: Student & Laptop Verified Records */}
              <div className="sm:col-span-7 space-y-4">
                {/* Student Record */}
                <div className="flex items-start space-x-3 bg-sky-50/70 p-3 rounded-lg border border-sky-200/60">
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-14 h-14 rounded-lg object-cover border-2 border-[#007BB6] shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#007BB6] uppercase tracking-wider block">
                      Registered Student Owner
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{student.name}</h4>
                    <p className="text-xs font-mono font-bold text-[#083B66]">{student.reg_no}</p>
                    <p className="text-[11px] text-slate-600 truncate">{student.course}</p>
                    <p className="text-[11px] text-slate-500">{student.phone}</p>
                  </div>
                </div>

                {/* Laptop Record */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Authorized Hardware Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Brand & Model:</span>
                      <strong className="text-slate-800 text-xs sm:text-sm font-semibold">
                        {laptop.brand} {laptop.model}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Hardware Serial No:</span>
                      <strong className="text-slate-900 font-mono font-bold bg-[#FAB582]/30 px-1 py-0.5 rounded text-xs">
                        {laptop.serial_no}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Color Finish:</span>
                      <span className="text-slate-700">{laptop.color || 'Standard Metallic'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Security Clear Code:</span>
                      <span className="text-slate-700 font-mono text-[11px]">MMUST-SEC-OK</span>
                    </div>
                  </div>
                </div>

                {/* Stolen Alert or Instructions */}
                {isStolen ? (
                  <div className="bg-red-50 border-2 border-red-500 p-3 rounded-lg flex items-start space-x-2 text-red-800 text-xs">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block">CONFISCATE UPON SIGHT</strong>
                      <span>{laptop.stolen_notes || 'This laptop was reported stolen from MMUST premises.'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-lg text-[11px] text-amber-900 leading-tight">
                    <strong>Gate Protocol Notice:</strong> Present this QR pass on your phone screen or as a printed sticker on your laptop bag/casing at any MMUST gate checkpoint. Guards verify within 5 seconds without requiring counter-book recording.
                  </div>
                )}
              </div>
            </div>

            {/* University Security Seal Footer */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#007BB6]" />
                <span>VERIFIED BY MMUST CAMPUS SECURITY DIRECTORY • KAKAMEGA, KENYA</span>
              </div>
              <div>ENCRYPTED TOKEN: {laptop.laptop_id}-SHA256</div>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="print:hidden bg-slate-100 px-6 py-3 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Tip: You can take a screenshot on your smartphone for offline clearance at gates.
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Pass
          </button>
        </div>
      </div>
    </div>
  );
};
