import React, { useState } from 'react';
import { Student, Laptop } from '../../types';
import { StorageService } from '../../services/storage';
import { Laptop as LaptopIcon, X, Upload, CheckCircle2, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterLaptopModalProps {
  student: Student;
  onClose: () => void;
  onRegistered: (newLaptop: Laptop) => void;
}

const SAMPLE_LAPTOP_PHOTOS = [
  { label: 'Silver Ultrabook (HP/Dell)', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dark Matte Laptop (Lenovo/Dell)', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80' },
  { label: 'Black Business ThinkPad', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80' },
  { label: 'MacBook Space Gray', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Blue Slim Laptop (Asus/Acer)', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80' },
];

export const RegisterLaptopModal: React.FC<RegisterLaptopModalProps> = ({
  student,
  onClose,
  onRegistered,
}) => {
  const [brand, setBrand] = useState('HP');
  const [model, setModel] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [color, setColor] = useState('Silver / Grey');
  const [photo, setPhoto] = useState(SAMPLE_LAPTOP_PHOTOS[0].url);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSerial = serialNo.trim().toUpperCase();
    if (!cleanSerial) {
      setError('Please provide the physical serial number of the laptop.');
      return;
    }

    if (!model.trim()) {
      setError('Please enter the laptop model name (e.g. EliteBook 840 G6, Latitude 5490).');
      return;
    }

    if (!hasAgreed) {
      setError('You must confirm ownership under MMUST gate regulations.');
      return;
    }

    // Check if serial already exists
    const existing = StorageService.findLaptopBySerialOrReg(cleanSerial);
    if (existing) {
      setError(`Hardware serial number "${cleanSerial}" is already registered in the MMUST database under laptop ID ${existing.laptop_id}! If this is your device, report it to the Security Directorate.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const registered = StorageService.registerLaptop({
        reg_no: student.reg_no,
        brand: brand.trim(),
        model: model.trim(),
        serial_no: cleanSerial,
        color: color.trim(),
        photo: photo || SAMPLE_LAPTOP_PHOTOS[0].url,
        status: 'Active',
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      onRegistered(registered);
    } catch {
      setError('An error occurred during registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#042038] to-[#083B66] text-white px-6 py-4 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAB582]/20 border border-[#FAB582]/40 flex items-center justify-center text-[#FAB582]">
              <LaptopIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Register New Laptop</h3>
              <p className="text-xs text-sky-200">
                MMUST Digital Property & Gate Pass Clearance Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sky-300 hover:text-white p-1 rounded-lg hover:bg-sky-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Owner Reminder */}
        <div className="bg-sky-50 px-6 py-2.5 border-b border-sky-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500">Student Owner: </span>
            <strong className="text-[#083B66]">{student.name}</strong>
          </div>
          <span className="font-mono font-bold text-[#083B66] bg-sky-200/70 px-2 py-0.5 rounded">
            {student.reg_no}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-800 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Laptop Manufacturer / Brand *
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#007BB6] focus:outline-none"
              >
                <option value="HP">HP (Hewlett-Packard)</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Apple">Apple MacBook</option>
                <option value="Asus">Asus</option>
                <option value="Acer">Acer</option>
                <option value="Toshiba">Toshiba</option>
                <option value="Samsung">Samsung</option>
                <option value="Huawei">Huawei MateBook</option>
                <option value="Microsoft">Microsoft Surface</option>
                <option value="Other">Other Brand</option>
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Model Name / Series *
              </label>
              <input
                type="text"
                placeholder="e.g. EliteBook 840 G6, Latitude 5490"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#007BB6] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Serial Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Physical Serial Number (S/N) *
              </label>
              <input
                type="text"
                placeholder="e.g. 5CD83419KZ or 8B21XQ2"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#FAB582] focus:outline-none uppercase"
                required
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Found on underside sticker or run `wmic bios get serialnumber` in CMD
              </span>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Casing Color / Distinguishing Marks
              </label>
              <input
                type="text"
                placeholder="e.g. Silver, Matte Black, Blue sticker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#007BB6] focus:outline-none"
              />
            </div>
          </div>

          {/* Device Photo selection or custom upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Laptop Verification Photo *</span>
              <span className="text-[11px] text-[#007BB6] font-normal">Displayed to guard on gate scan</span>
            </label>

            <div className="flex items-center space-x-3 mb-3">
              <div className="w-20 h-16 rounded-lg overflow-hidden border-2 border-[#007BB6] shrink-0 bg-slate-100 shadow-sm">
                <img src={photo} alt="Laptop Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#007BB6]" />
                  <span>Upload Real Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Or select a standard matching stock preview below:
                </span>
              </div>
            </div>

            {/* Quick stock photos */}
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_LAPTOP_PHOTOS.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPhoto(item.url)}
                  className={`relative rounded-md overflow-hidden border-2 transition-all p-0.5 ${
                    photo === item.url ? 'border-[#007BB6] ring-2 ring-sky-300' : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                  title={item.label}
                >
                  <img src={item.url} alt={item.label} className="w-full h-10 object-cover rounded" />
                </button>
              ))}
            </div>
          </div>

          {/* Legal / Policy Agreement */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#007BB6] rounded border-slate-300 focus:ring-[#007BB6]"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I solemnly certify that this laptop is my lawful personal property. I agree that registering false serial numbers or stolen equipment is a disciplinary offense under the <strong>MMUST Student Code of Conduct</strong> and Kenyan law.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#007BB6] hover:bg-[#083B66] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#FAB582]" />
              <span>Register & Generate Clearance QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
