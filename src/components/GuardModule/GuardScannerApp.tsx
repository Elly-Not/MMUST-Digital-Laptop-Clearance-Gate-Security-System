import React, { useState, useEffect, useRef } from 'react';
import { Laptop, Student, SecurityGuard, GateLog, StudentNotification } from '../../types';
import { StorageService } from '../../services/storage';
import { MMUST_GATES } from '../../data/mockData';
import { playScanSuccessBeep, playClearanceConfirmedSound, playStolenAlarm, stopStolenAlarm } from '../../utils/audio';
import { decodeQrFromImage } from '../../utils/qr';
import { MMUSTLogo } from '../Common/MMUSTLogo';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  CameraOff,
  Upload,
  Search,
  CheckCircle2,
  AlertOctagon,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  ShieldAlert,
  Send,
  Building,
  User,
  Smartphone,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuardScannerAppProps {
  onDataChanged: () => void;
}

export const GuardScannerApp: React.FC<GuardScannerAppProps> = ({ onDataChanged }) => {
  const guards = StorageService.getGuards();
  const [selectedGate, setSelectedGate] = useState<string>(MMUST_GATES[0]);
  const [selectedGuard, setSelectedGuard] = useState<SecurityGuard>(guards[0]);

  // Occupancy stats for the selected gate
  const [occupancy, setOccupancy] = useState(() => StorageService.getGateOccupancyStats(selectedGate));

  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState<string>('');
  
  // Scanned item state
  const [scannedLaptop, setScannedLaptop] = useState<Laptop | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [laptopLocation, setLaptopLocation] = useState<{ status: 'Inside' | 'Outside'; lastLog?: GateLog } | null>(null);
  const [gateNotes, setGateNotes] = useState<string>('');
  const [sendNotificationToStudent, setSendNotificationToStudent] = useState<boolean>(true);
  const [recentNotificationToast, setRecentNotificationToast] = useState<StudentNotification | null>(null);

  // Siren alert state
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const stopSirenRef = useRef<(() => void) | null>(null);

  // Camera video and canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshStats = () => {
    setOccupancy(StorageService.getGateOccupancyStats(selectedGate));
    onDataChanged();
  };

  useEffect(() => {
    refreshStats();
  }, [selectedGate]);

  // Cleanup camera and audio on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (stopSirenRef.current) {
        stopSirenRef.current();
      }
      stopStolenAlarm();
    };
  }, []);

  // Handle camera start/stop
  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera. Check browser permissions or use Quick Test / Manual Scan below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsCameraActive(false);
  };

  // Continuous frame scanning loop
  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodedCode(code.data);
            return;
          }
        }
      }
    }
    if (streamRef.current) {
      animationFrameId.current = requestAnimationFrame(tickScan);
    }
  };

  // Process decoded QR or manual query
  const handleDecodedCode = (decodedString: string) => {
    stopCamera();

    // Look up laptop
    const laptop = StorageService.findLaptopBySerialOrReg(decodedString);
    if (!laptop) {
      alert(`Invalid or Unrecognized QR Code: "${decodedString}". No registered laptop in MMUST database matches this token.`);
      return;
    }

    const student = StorageService.getStudentByRegNo(laptop.reg_no);
    const loc = StorageService.getLaptopCurrentLocation(laptop.laptop_id);

    setScannedLaptop(laptop);
    setScannedStudent(student || null);
    setLaptopLocation(loc);
    setGateNotes('');

    if (laptop.status === 'Stolen') {
      // TRIGGER EMERGENCY SIREN
      const stopper = playStolenAlarm(8000);
      stopSirenRef.current = stopper;
      setIsSirenActive(true);
    } else {
      playScanSuccessBeep();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const qrText = await decodeQrFromImage(reader.result);
          if (qrText) {
            handleDecodedCode(qrText);
          } else {
            alert('Could not decode QR code from the uploaded photo. Please try a clearer picture or enter Serial Number manually.');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    handleDecodedCode(manualQuery.trim());
  };

  const handleLogAction = (action: 'Entry' | 'Exit') => {
    if (!scannedLaptop || !scannedStudent) return;

    const { log, notification } = StorageService.addGateLog({
      laptop_id: scannedLaptop.laptop_id,
      reg_no: scannedLaptop.reg_no,
      guard_id: selectedGuard.guard_id,
      gate: selectedGate,
      action,
      status_at_scan: scannedLaptop.status,
      notes: gateNotes.trim() || undefined,
    });

    playClearanceConfirmedSound();

    if (notification && sendNotificationToStudent) {
      setRecentNotificationToast(notification);
      setTimeout(() => setRecentNotificationToast(null), 7000);
    }

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
    });

    refreshStats();

    // Clear active scanned card after brief delay
    setTimeout(() => {
      setScannedLaptop(null);
      setScannedStudent(null);
      setLaptopLocation(null);
    }, 1800);
  };

  const handleMuteSiren = () => {
    if (stopSirenRef.current) {
      stopSirenRef.current();
    }
    stopStolenAlarm();
    setIsSirenActive(false);
  };

  const allLaptops = StorageService.getLaptops();
  const stolenLaptops = allLaptops.filter((l) => l.status === 'Stolen');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Real-time Student Notification Toast when guard logs gate clearance */}
      {recentNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#042038] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#FAB582] max-w-md animate-bounce sm:animate-none">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#FAB582] text-[#052642] flex items-center justify-center shrink-0 font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-[#FAB582]">STUDENT NOTIFIED VIA SMS & APP</h5>
                <span className="text-[10px] text-sky-200">{recentNotificationToast.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-white mt-0.5">{recentNotificationToast.title}</p>
              <p className="text-[11px] text-sky-100 mt-1 line-clamp-2">{recentNotificationToast.message}</p>
              <div className="mt-2 text-[10px] bg-[#021424] px-2 py-0.5 rounded text-sky-300 font-mono">
                Recipient: {recentNotificationToast.recipient_phone} ({recentNotificationToast.reg_no})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Gate & Officer Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        {/* Gate Selection */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-sky-100 text-[#007BB6] border border-sky-300 flex items-center justify-center shrink-0 shadow-inner">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active MMUST Security Gate
            </label>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="mt-0.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold text-[#083B66] focus:ring-2 focus:ring-[#007BB6] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All MMUST University Gates (Consolidated)</option>
              {MMUST_GATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Security Officer */}
        <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <img
            src={selectedGuard.photo}
            alt={selectedGuard.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#007BB6] shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-800">{selectedGuard.name}</span>
              <span className="bg-[#FAB582] text-[#052642] text-[10px] font-mono font-black px-1.5 py-0.2 rounded">
                {selectedGuard.badge_no}
              </span>
            </div>
            <select
              value={selectedGuard.guard_id}
              onChange={(e) => {
                const found = guards.find((g) => g.guard_id === e.target.value);
                if (found) setSelectedGuard(found);
              }}
              className="text-[11px] text-slate-600 bg-transparent border-0 focus:outline-none cursor-pointer hover:underline"
            >
              {guards.map((g) => (
                <option key={g.guard_id} value={g.guard_id}>
                  Switch Officer: {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* REQUIRED USER SPECIFICATION: SUMMARY CARD AT THE TOP            */}
      {/* Shows total number of laptops currently logged as 'Inside' vs   */}
      {/* 'Outside' for the selected gate.                               */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#083B66] via-[#007BB6] to-[#042038] rounded-2xl p-5 sm:p-6 text-white shadow-xl border-2 border-[#FAB582] relative overflow-hidden">
        {/* Subtle Watermark Branding */}
        <div className="absolute right-2 -bottom-6 opacity-10 pointer-events-none select-none">
          <MMUSTLogo size="xl" />
        </div>

        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-700/80 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAB582] text-[#052642] flex items-center justify-center font-black shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
                Gate Inventory & Laptop Occupancy Summary
              </h2>
              <p className="text-xs text-sky-200/90 font-medium">
                Live clearance headcount for: <strong className="text-[#FAB582]">{selectedGate}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={refreshStats}
            className="text-xs bg-[#042038] hover:bg-[#021424] text-[#FAB582] px-3 py-1.5 rounded-lg border border-sky-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Counts</span>
          </button>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          
          {/* Card 1: Currently Inside Campus */}
          <div className="bg-[#042038]/90 rounded-xl p-4 border-2 border-sky-400/50 shadow-md hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between text-xs text-sky-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
                CURRENTLY INSIDE
              </span>
              <LogIn className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {occupancy.inside}
              </span>
              <span className="text-xs text-sky-300 font-semibold">Laptops</span>
            </div>
            <p className="text-[11px] text-sky-200/70 mt-1 font-medium">
              Verified inside campus grounds
            </p>
          </div>

          {/* Card 2: Currently Outside Campus */}
          <div className="bg-[#042038]/90 rounded-xl p-4 border-2 border-[#FAB582]/60 shadow-md hover:border-[#FAB582] transition-all">
            <div className="flex items-center justify-between text-xs text-[#FAB582] font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FAB582]"></span>
                CURRENTLY OUTSIDE
              </span>
              <LogOut className="w-4 h-4 text-[#FAB582]" />
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {occupancy.outside}
              </span>
              <span className="text-xs text-amber-200 font-semibold">Laptops</span>
            </div>
            <p className="text-[11px] text-amber-200/70 mt-1 font-medium">
              Off campus or exited premises
            </p>
          </div>

          {/* Card 3: Today's Gate Traffic */}
          <div className="bg-[#042038]/90 rounded-xl p-4 border border-sky-600/50 shadow-md">
            <div className="flex items-center justify-between text-xs text-sky-200 font-semibold mb-1">
              <span>TODAY'S CLEARANCES</span>
              <span className="text-[10px] bg-sky-900 px-1.5 py-0.5 rounded font-mono">Today</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-[#FAB582] font-mono">
                {occupancy.todayEntries + occupancy.todayExits}
              </span>
              <span className="text-xs text-sky-200 font-semibold">Passes</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-sky-300/80 mt-1">
              <span>↓ {occupancy.todayEntries} Entries</span>
              <span>•</span>
              <span>↑ {occupancy.todayExits} Exits</span>
            </div>
          </div>

          {/* Card 4: Stolen Device Watchlist */}
          <div className={`rounded-xl p-4 border shadow-md transition-all ${
            stolenLaptops.length > 0
              ? 'bg-red-950/80 border-red-500/80 text-white'
              : 'bg-[#042038]/90 border-sky-600/50'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className={stolenLaptops.length > 0 ? 'text-red-300 flex items-center gap-1 font-bold' : 'text-sky-200'}>
                {stolenLaptops.length > 0 && <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                BLACKLIST WATCHLIST
              </span>
              <ShieldAlert className={`w-4 h-4 ${stolenLaptops.length > 0 ? 'text-red-400' : 'text-sky-400'}`} />
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className={`text-3xl sm:text-4xl font-black font-mono ${stolenLaptops.length > 0 ? 'text-red-400' : 'text-white'}`}>
                {stolenLaptops.length}
              </span>
              <span className="text-xs text-slate-300 font-semibold">Stolen Flagged</span>
            </div>
            <p className="text-[11px] mt-1 text-slate-300/80">
              {stolenLaptops.length > 0 ? 'Active RED siren on scan' : 'No stolen flags'}
            </p>
          </div>

        </div>

        {/* Visual Ratio Bar */}
        <div className="mt-4 pt-3 border-t border-sky-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sky-200">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="font-semibold text-xs text-sky-100">Ratio:</span>
            <div className="w-full sm:w-64 h-2.5 bg-[#042038] rounded-full overflow-hidden flex border border-sky-700">
              <div
                style={{
                  width: `${(occupancy.inside / Math.max(1, occupancy.inside + occupancy.outside)) * 100}%`,
                }}
                className="bg-[#007BB6] h-full transition-all duration-500"
                title={`${occupancy.inside} Inside`}
              />
              <div
                style={{
                  width: `${(occupancy.outside / Math.max(1, occupancy.inside + occupancy.outside)) * 100}%`,
                }}
                className="bg-[#FAB582] h-full transition-all duration-500"
                title={`${occupancy.outside} Outside`}
              />
            </div>
          </div>
          <span className="text-[11px] text-sky-300/80 italic">
            Automated sync with student gate scans • Target processing: &lt; 5 seconds
          </span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCANNER CONSOLE & ACTIONS                                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Scanner / Camera / Quick Buttons (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-[#007BB6]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Gate QR Scanner (Camera & Quick Access)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#083B66] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Camera Live Feed Ready
              </span>
            </div>

            {/* Video Viewfinder / Scanner Area */}
            <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Overlay */}
              {isCameraActive ? (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-[#FAB582] rounded-2xl relative shadow-2xl">
                    {/* Corner Reticles */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-sky-400 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-sky-400 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-sky-400 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-sky-400 -mb-1 -mr-1"></div>

                    {/* Animated Scanning Beam */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FAB582] to-transparent animate-pulse absolute top-1/2"></div>
                  </div>
                  <span className="absolute bottom-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium">
                    Align student QR code inside box
                  </span>
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#042038] border border-sky-700/50 flex items-center justify-center mx-auto text-[#FAB582]">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Camera Feed Offline</h4>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
                      Activate phone/device camera to scan printed stickers or phone screens in real-time.
                    </p>
                  </div>
                  {cameraError && (
                    <p className="text-xs text-amber-300 bg-amber-950/80 p-2 rounded-lg border border-amber-800">
                      {cameraError}
                    </p>
                  )}
                  <button
                    onClick={startCamera}
                    className="bg-[#007BB6] hover:bg-[#083B66] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 mx-auto shadow-md transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#FAB582]" />
                    <span>Launch Gate Camera</span>
                  </button>
                </div>
              )}

              {/* Stop camera floating button */}
              {isCameraActive && (
                <button
                  onClick={stopCamera}
                  className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            {/* QR File Upload & Manual Scan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Upload QR Image */}
              <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-[#007BB6]" />
                <span>Upload QR Image / Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSearch} className="flex space-x-1.5">
                <input
                  type="text"
                  placeholder="Enter Serial or Reg No..."
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#007BB6] focus:outline-none uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-[#007BB6] hover:bg-[#083B66] text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </button>
              </form>
            </div>

            {/* Quick Test Demo Scanner Buttons */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simulate Instant Student Gate Arrival:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleDecodedCode('5CD83419KZ')}
                  className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-950 p-2 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <span className="text-[10px] text-[#007BB6] font-bold block">Brian (BIT)</span>
                  <span className="text-xs font-semibold">HP EliteBook</span>
                  <span className="text-[9px] text-sky-700 font-mono block">Status: Active</span>
                </button>

                <button
                  onClick={() => handleDecodedCode('8B21XQ2')}
                  className="bg-red-50 hover:bg-red-100 border-2 border-red-400 text-red-950 p-2 rounded-lg text-left transition-colors cursor-pointer"
                  title="Simulates scanning Faith Mwende's stolen Dell laptop - triggers siren"
                >
                  <span className="text-[10px] text-red-700 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-600" />
                    Faith (COM)
                  </span>
                  <span className="text-xs font-bold text-red-900">Dell Latitude</span>
                  <span className="text-[9px] text-red-700 font-bold block">🚨 STOLEN!</span>
                </button>

                <button
                  onClick={() => handleDecodedCode('PF2M8A9K')}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 p-2 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <span className="text-[10px] text-slate-500 font-bold block">Kelvin (ENG)</span>
                  <span className="text-xs font-semibold">ThinkPad T14</span>
                  <span className="text-[9px] text-sky-700 font-mono block">Status: Active</span>
                </button>

                <button
                  onClick={() => handleDecodedCode('C02G901LQ6L4')}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 p-2 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <span className="text-[10px] text-slate-500 font-bold block">Sharon (BBIT)</span>
                  <span className="text-xs font-semibold">MacBook Air</span>
                  <span className="text-[9px] text-sky-700 font-mono block">Status: Active</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Scan Verification Result or Alert Screen (lg:col-span-5) */}
        <div className="lg:col-span-5">
          {!scannedLaptop ? (
            /* Standby Card */
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center h-full min-h-[360px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <QrCode className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Awaiting QR Clearance Scan</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Scan the student's laptop QR sticker or phone screen to verify ownership and log Entry/Exit in under 5 seconds.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#083B66] bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#007BB6]" />
                <span>Instant automated student notifications enabled</span>
              </div>
            </div>
          ) : scannedLaptop.status === 'Stolen' ? (
            /* ======================================================= */
            /* FLASHING RED EMERGENCY SCREEN FOR STOLEN LAPTOP         */
            /* ======================================================= */
            <div className="bg-red-600 rounded-2xl p-6 text-white shadow-2xl border-4 border-red-950 animate-pulse relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-red-400/80 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-8 h-8 text-amber-300 animate-bounce" />
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white uppercase">
                      CRITICAL ALERT: STOLEN DEVICE
                    </h3>
                    <span className="text-xs text-amber-200 font-bold">
                      DETAIN CARRIER IMMEDIATELY • DO NOT ALLOW EXIT
                    </span>
                  </div>
                </div>

                {isSirenActive && (
                  <button
                    onClick={handleMuteSiren}
                    className="bg-black/60 hover:bg-black/80 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-white/40 cursor-pointer"
                  >
                    <VolumeX className="w-4 h-4 text-amber-300" />
                    <span>Silence Siren</span>
                  </button>
                )}
              </div>

              {/* Stolen Details */}
              <div className="bg-red-700/80 rounded-xl p-4 border border-red-500 space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={scannedLaptop.photo}
                    alt={scannedLaptop.model}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">Stolen Hardware</span>
                    <strong className="text-sm font-black text-white block">
                      {scannedLaptop.brand} {scannedLaptop.model}
                    </strong>
                    <span className="font-mono text-xs bg-red-900 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                      S/N: {scannedLaptop.serial_no}
                    </span>
                  </div>
                </div>

                <div className="bg-red-900/90 p-3 rounded-lg border border-red-400 text-xs">
                  <strong className="text-amber-300 block mb-0.5">MMUST Security Case Notes:</strong>
                  <p className="text-red-100 font-medium">
                    {scannedLaptop.stolen_notes || 'Device marked stolen by registered student owner.'}
                  </p>
                </div>

                {scannedStudent && (
                  <div className="bg-red-950/70 p-3 rounded-lg border border-red-800 text-xs">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">
                      Registered Rightful Owner
                    </span>
                    <p className="text-white font-bold">{scannedStudent.name} ({scannedStudent.reg_no})</p>
                    <p className="text-red-200">{scannedStudent.phone}</p>
                  </div>
                )}
              </div>

              {/* Interception Action Buttons */}
              <div className="mt-4 pt-3 border-t border-red-500 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    handleLogAction('Exit');
                    alert('Interception record logged! MMUST Security Dispatch has been notified.');
                  }}
                  className="bg-black hover:bg-neutral-900 text-amber-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 flex-1 shadow-lg cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Log Gate Interception & Confiscate</span>
                </button>
                <button
                  onClick={() => {
                    setScannedLaptop(null);
                    setScannedStudent(null);
                    handleMuteSiren();
                  }}
                  className="bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded-xl text-xs font-bold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* VERIFIED ACTIVE LAPTOP CLEARANCE CARD                   */
            /* ======================================================= */
            <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-[#007BB6] space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#007BB6] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#007BB6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Clearance Verified (Active)
                    </h3>
                    <span className="text-[11px] text-[#083B66] font-semibold">
                      Authentication Speed: 1.2s • MMUST Registered
                    </span>
                  </div>
                </div>

                {/* Current Location Badge */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current State</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    laptopLocation?.status === 'Inside'
                      ? 'bg-sky-100 text-[#083B66]'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Currently {laptopLocation?.status || 'Outside'}
                  </span>
                </div>
              </div>

              {/* Student & Laptop Verified Info */}
              {scannedStudent && (
                <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200 flex items-start space-x-3">
                  <img
                    src={scannedStudent.photo}
                    alt={scannedStudent.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-[#007BB6] shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#007BB6] uppercase tracking-wider block">
                      Student Owner Verified
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{scannedStudent.name}</h4>
                    <p className="text-xs font-mono font-bold text-[#083B66]">{scannedStudent.reg_no}</p>
                    <p className="text-[11px] text-slate-600 truncate">{scannedStudent.course}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{scannedStudent.phone}</p>
                  </div>
                </div>
              )}

              {/* Laptop Hardware Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center space-x-3">
                <img
                  src={scannedLaptop.photo}
                  alt={scannedLaptop.model}
                  className="w-16 h-12 rounded-lg object-cover border border-slate-300 shrink-0"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Hardware Profile</span>
                  <strong className="text-slate-900 block truncate font-semibold">
                    {scannedLaptop.brand} {scannedLaptop.model}
                  </strong>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] font-bold bg-[#FAB582]/40 text-[#052642] px-1.5 py-0.2 rounded">
                      {scannedLaptop.serial_no}
                    </span>
                    <span className="text-slate-500 text-[11px]">{scannedLaptop.color}</span>
                  </div>
                </div>
              </div>

              {/* Notification & Notes Checkbox */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendNotificationToStudent}
                    onChange={(e) => setSendNotificationToStudent(e.target.checked)}
                    className="w-4 h-4 text-[#007BB6] rounded border-slate-300 focus:ring-[#007BB6]"
                  />
                  <span className="font-medium flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#007BB6]" />
                    Send immediate clearance notification to student's phone & portal
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Officer notes (optional, e.g. carrying mouse, bag color)..."
                  value={gateNotes}
                  onChange={(e) => setGateNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#007BB6] focus:outline-none"
                />
              </div>

              {/* Big Action Buttons: Entry vs Exit */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleLogAction('Entry')}
                  className="bg-[#007BB6] hover:bg-[#083B66] text-white py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#FAB582]" />
                  <span>ALLOW ENTRY</span>
                </button>

                <button
                  onClick={() => handleLogAction('Exit')}
                  className="bg-[#083B66] hover:bg-[#042038] text-white py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-[#FAB582]"
                >
                  <LogOut className="w-4 h-4 text-[#FAB582]" />
                  <span>ALLOW EXIT</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => {
                    setScannedLaptop(null);
                    setScannedStudent(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Cancel & Scan Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
