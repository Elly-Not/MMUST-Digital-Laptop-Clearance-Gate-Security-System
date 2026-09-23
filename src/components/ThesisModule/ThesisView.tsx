import React, { useState } from 'react';
import { BookOpen, Copy, Check, Code, FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MMUSTLogo } from '../Common/MMUSTLogo';

export const ThesisView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeChapter, setActiveChapter] = useState<'ch1' | 'ch2' | 'ch3' | 'code'>('ch1');

  const djangoModelsCode = `# models.py - MMUST Digital Laptop Clearance System
from django.db import models

class Student(models.Model):
    reg_no = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    course = models.CharField(max_length=100)

    def __str__(self):
        return self.reg_no

class Laptop(models.Model):
    laptop_id = models.CharField(max_length=15, primary_key=True)
    reg_no = models.ForeignKey(Student, on_delete=models.CASCADE)
    model = models.CharField(max_length=100)
    serial_no = models.CharField(max_length=50, unique=True)
    photo = models.ImageField(upload_to='laptops/')
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True)
    STATUS_CHOICES = [('Active', 'Active'), ('Stolen', 'Stolen')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

class SecurityGuard(models.Model):
    guard_id = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=100)
    gate_assigned = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)

class GateLog(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    laptop_id = models.ForeignKey(Laptop, on_delete=models.CASCADE)
    guard_id = models.ForeignKey(SecurityGuard, on_delete=models.CASCADE)
    entry_time = models.TimeField(null=True)
    exit_time = models.TimeField(null=True)
    date = models.DateField(auto_now_add=True)

# QR Code Generation (Django View Helper)
import qrcode
from django.core.files import File
from io import BytesIO

def generate_qr(laptop):
    data = f"{laptop.reg_no.reg_no}-{laptop.serial_no}"
    qr = qrcode.make(data)
    buffer = BytesIO()
    qr.save(buffer)
    laptop.qr_code.save(f"{laptop.laptop_id}.png", File(buffer), save=False)
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(djangoModelsCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Thesis Header */}
      <div className="bg-gradient-to-r from-[#042038] to-[#083B66] text-white rounded-2xl p-6 shadow-xl border-2 border-[#FAB582] flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <MMUSTLogo size="lg" />
          <div>
            <span className="bg-[#FAB582] text-[#052642] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Academic Project Proposal & Research
            </span>
            <h2 className="text-base sm:text-xl font-black text-white mt-1">
              MMUST Digital Laptop Clearance & Gate Security System
            </h2>
            <p className="text-xs text-sky-200">
              Department of Computer Science / Information Technology • Masinde Muliro University
            </p>
          </div>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveChapter('ch1')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeChapter === 'ch1'
              ? 'bg-[#007BB6] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Chapter 1: Introduction
        </button>
        <button
          onClick={() => setActiveChapter('ch2')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeChapter === 'ch2'
              ? 'bg-[#007BB6] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Chapter 2: Literature Review
        </button>
        <button
          onClick={() => setActiveChapter('ch3')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeChapter === 'ch3'
              ? 'bg-[#007BB6] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Chapter 3: Methodology
        </button>
        <button
          onClick={() => setActiveChapter('code')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeChapter === 'code'
              ? 'bg-[#007BB6] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code className="w-4 h-4 text-[#FAB582]" />
          <span>Django Code & Models</span>
        </button>
      </div>

      {/* Chapter Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 text-sm text-slate-700 leading-relaxed">
        
        {activeChapter === 'ch1' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#007BB6] uppercase tracking-wider block">Chapter 1</span>
              <h3 className="text-xl font-black text-slate-900">Introduction & Problem Statement</h3>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">1.1 Background</h4>
              <p>
                At Masinde Muliro University of Science and Technology (MMUST), security officers manually check and record student laptops in a paper counter-book at the entrance gates (Main Gate, Gate B, Gate C). This causes long queues, time wastage during peak class transition hours, and leaves no digital audit trail to track stolen electronic assets.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">1.2 Problem Statement</h4>
              <p>
                The current manual system is slow, insecure, and lacks a database. Students are forced to physically unbag and expose their laptops daily, leading to wear and tear. Furthermore, if a laptop is stolen from the library or hostels, gate guards have no proof of ownership or instant blacklist to intercept suspects attempting to exit campus.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">1.3 Objectives</h4>
              <p className="font-semibold text-slate-800">Main Objective:</p>
              <p>To develop a QR-code-based digital laptop clearance system for MMUST with real-time student notification dispatch.</p>
              
              <p className="font-semibold text-slate-800 mt-2">Specific Objectives:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To allow students to register their laptops online and generate cryptographically verified QR gate passes.</li>
                <li>To develop a mobile scanner application for security guards at MMUST main gate and sub-gates.</li>
                <li>To create a central database to log entry/exit timestamps, send automated SMS alerts to students, and flag stolen devices.</li>
                <li>To test the system at MMUST Main Gate along the Kakamega - Webuye highway.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">1.4 Justification & Impact</h4>
              <div className="bg-sky-50 border border-sky-300 rounded-xl p-4 text-[#083B66] font-medium">
                ⚡ <strong>Reduction of Gate Processing Time:</strong> Drops clearance time from <strong>~2 minutes down to under 5 seconds</strong> per student. Improves campus security and provides digital proof of ownership with automatic SMS notifications delivered directly to the student's phone.
              </div>
            </div>
          </div>
        )}

        {activeChapter === 'ch2' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#007BB6] uppercase tracking-wider block">Chapter 2</span>
              <h3 className="text-xl font-black text-slate-900">Literature Review & Existing Systems</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold mb-1">a) Manual Book Entry (Current MMUST)</strong>
                <p className="text-xs text-slate-600">
                  Guards write serial numbers in counter-books. <em>Weakness:</em> Slow (~2 min/student), books get lost/damaged, handwriting illegible, no stolen device lookup.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold mb-1">b) Kenyatta University Laptop Sticker System</strong>
                <p className="text-xs text-slate-600">
                  Uses physical stickers with serial numbers. <em>Weakness:</em> Stickers peel or fade, easy to forge, lack real-time database verification.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold mb-1">c) Commercial QR Asset Systems (Jumia, Safaricom)</strong>
                <p className="text-xs text-slate-600">
                  Used for retail logistics. <em>Weakness:</em> Enterprise-focused, no student academic ID linkage or university gate workflow.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold mb-1">d) RFID University Gate Passes (Strathmore, USIU)</strong>
                <p className="text-xs text-slate-600">
                  Automated card gates. <em>Weakness:</em> High cost (&gt; Ksh 1,000 per card + turnstile hardware). QR is free and accessible on student phones.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 text-amber-950">
              <h4 className="font-bold text-sm mb-1">Identified Research Gap:</h4>
              <p className="text-xs leading-relaxed">
                No Kenyan public university currently utilizes a free, student-centric, QR-code laptop clearance system that couples camera-based mobile scanning with instant student SMS alerts and a centralized stolen-device gate siren blacklist.
              </p>
            </div>
          </div>
        )}

        {activeChapter === 'ch3' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#007BB6] uppercase tracking-wider block">Chapter 3</span>
              <h3 className="text-xl font-black text-slate-900">System Methodology & Agile Implementation</h3>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">3.2 Agile Scrum Methodology</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs">
                  <span className="font-bold text-[#083B66] block">Sprint 1</span>
                  Student Registration & QR Generation
                </div>
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs">
                  <span className="font-bold text-[#083B66] block">Sprint 2</span>
                  Guard Mobile Scanner & Inside/Outside Stats
                </div>
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs">
                  <span className="font-bold text-[#083B66] block">Sprint 3</span>
                  Blacklist Siren & Automated Student Alerts
                </div>
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs">
                  <span className="font-bold text-[#083B66] block">Sprint 4</span>
                  Gate Pilot Testing at MMUST Main Gate
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">3.4 Functional & Non-Functional Requirements</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Clearance Speed:</strong> Scanning and verification response under 5 seconds.</li>
                <li><strong>Offline & Mobile Capable:</strong> Operable on low-end Android mobile devices used by guards.</li>
                <li><strong>Automated Notifications:</strong> Instant confirmation sent to student phone and account.</li>
                <li><strong>Security Protocol:</strong> Red emergency alert screen and siren triggered upon blacklisted serial scan.</li>
              </ul>
            </div>
          </div>
        )}

        {activeChapter === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Python Django Implementation Models</h3>
                <p className="text-xs text-slate-500">models.py schema with Student, Laptop, SecurityGuard, GateLog, and QR Generator</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-[#007BB6] hover:bg-[#083B66] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#FAB582]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Django Code'}</span>
              </button>
            </div>

            <pre className="bg-[#042038] text-sky-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-sky-900 leading-relaxed">
              {djangoModelsCode}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
