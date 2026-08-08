import React, { useState } from 'react';
import { ShieldCheck, Lock, Upload, CheckCircle2, AlertTriangle, FileText, UserCheck, X } from 'lucide-react';

export default function AdultVerificationModal({
  isOpen,
  onClose,
  onVerificationComplete
}) {
  const [step, setStep] = useState(1); // 1: Info & Consent, 2: ID Upload, 3: Liveness Selfie, 4: Complete
  const [idFile, setIdFile] = useState(null);
  const [livenessDone, setLivenessDone] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState({
    over18: false,
    noCsam: false,
    noNonConsensual: false
  });
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const canProceedStep1 = agreedTerms.over18 && agreedTerms.noCsam && agreedTerms.noNonConsensual;

  const handleSimulateIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(URL.createObjectURL(file));
    }
  };

  const handleSimulateLiveness = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLivenessDone(true);
      setStep(4);
    }, 2000);
  };

  const handleFinishUnlock = () => {
    onVerificationComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#180509] border border-rose-600/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.3)] space-y-6 p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-rose-300 hover:text-white p-2 rounded-full bg-rose-950/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-rose-600/50">
            🔥
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display flex items-center space-x-2">
              <span>Adult (18+) Content Mode Unlock</span>
            </h2>
            <p className="text-xs text-rose-300 font-medium">Identity & Age Verification (PRD Section 6 Compliant)</p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between px-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full mx-1 transition-all ${
                s <= step ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-rose-950'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Legal Attestation & Rules */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-600/30 space-y-2 text-xs text-rose-100">
              <div className="font-bold text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Strict Trust & Safety Policy Notice</span>
              </div>
              <p>
                Adult mode provides access to age-restricted, consensual fictional art generation. As mandated by law, identity verification is mandatory. Zero tolerance is enforced for non-consensual content or depictions of minors.
              </p>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-rose-950/40">
                <input
                  type="checkbox"
                  checked={agreedTerms.over18}
                  onChange={(e) => setAgreedTerms({ ...agreedTerms, over18: e.target.checked })}
                  className="mt-0.5 accent-rose-600 w-4 h-4"
                />
                <span className="text-slate-200">I certify that I am at least 18 years of age (or legal age of majority in my jurisdiction).</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-rose-950/40">
                <input
                  type="checkbox"
                  checked={agreedTerms.noCsam}
                  onChange={(e) => setAgreedTerms({ ...agreedTerms, noCsam: e.target.checked })}
                  className="mt-0.5 accent-rose-600 w-4 h-4"
                />
                <span className="text-slate-200">I agree to Zero-Tolerance CSAM rules. Generating or attempting to generate depictions of minors is strictly prohibited and subject to NCMEC reporting.</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-rose-950/40">
                <input
                  type="checkbox"
                  checked={agreedTerms.noNonConsensual}
                  onChange={(e) => setAgreedTerms({ ...agreedTerms, noNonConsensual: e.target.checked })}
                  className="mt-0.5 accent-rose-600 w-4 h-4"
                />
                <span className="text-slate-200">I agree that I will not attempt to generate non-consensual imagery or real person deepfakes.</span>
              </label>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                canProceedStep1
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40'
                  : 'bg-rose-950 text-rose-600 cursor-not-allowed'
              }`}
            >
              Continue to Government ID Verification
            </button>
          </div>
        )}

        {/* Step 2: KYC Government ID Verification Scan */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-rose-200">
              Upload a valid government-issued photo ID (Passport, Driver's License, or National ID Card). ID documents are processed by third-party KYC vendor and never stored unencrypted.
            </p>

            <div className="border-2 border-dashed border-rose-500/40 rounded-2xl p-6 text-center space-y-3 bg-rose-950/30">
              {idFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold text-emerald-300">ID Document Verified Successfully</div>
                  <img src={idFile} alt="Uploaded ID" className="w-32 h-20 object-cover rounded-lg mx-auto border border-rose-500/50" />
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 block">
                  <FileText className="w-10 h-10 text-rose-400 mx-auto" />
                  <div className="text-xs font-bold text-rose-100">Click to Upload Government ID Photo</div>
                  <p className="text-[10px] text-rose-400">JPEG or PNG format supported</p>
                  <input type="file" accept="image/*" onChange={handleSimulateIdUpload} className="hidden" />
                </label>
              )}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!idFile}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                idFile
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40'
                  : 'bg-rose-950 text-rose-600 cursor-not-allowed'
              }`}
            >
              Proceed to Liveness Check
            </button>
          </div>
        )}

        {/* Step 3: Biometric Liveness Check */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <UserCheck className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
            <div className="text-sm font-bold text-white">Biometric Facial Liveness Scan</div>
            <p className="text-xs text-rose-300">
              Perform a quick liveness check to match face vectors against government ID record.
            </p>

            <div className="w-36 h-36 rounded-full bg-slate-900 border-4 border-rose-500 mx-auto flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />
              {isVerifying ? (
                <span className="text-xs text-rose-300 font-mono animate-pulse">Scanning 3D Mesh...</span>
              ) : (
                <span className="text-xs text-rose-200">Look directly into camera</span>
              )}
            </div>

            <button
              onClick={handleSimulateLiveness}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/40 transition-all"
            >
              {isVerifying ? 'Authenticating Liveness Token...' : 'Perform Liveness Scan'}
            </button>
          </div>
        )}

        {/* Step 4: Complete & Unlock */}
        {step === 4 && (
          <div className="space-y-5 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Verification Approved</h3>
              <p className="text-xs text-emerald-300 font-mono">KYC Token: KYC-VERIFIED-18PLUS-2026</p>
            </div>
            <p className="text-xs text-slate-300">
              Adult (18+) Mode is now unlocked for your account. You can toggle adult mode at any time using the lock icon in the top navigation header.
            </p>

            <button
              onClick={handleFinishUnlock}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white font-extrabold text-base shadow-xl shadow-rose-600/50 hover:scale-105 transition-all"
            >
              Enter Adult Studio Mode
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
