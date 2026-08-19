"use client";

import { useState } from "react";
import { QrCode, Copy, Check, Upload, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  fee: number;
  upiId: string | null;
  qrCodeUrl?: string | null | undefined;
  transactionIdValue?: string;
  onTransactionIdChange?: (val: string) => void;
}

export default function DynamicRegistrationFormPayment({
  fee,
  upiId,
  qrCodeUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [zoomQr, setZoomQr] = useState(false);

  const displayUpi = upiId || "varunsoni998@okaxis";
  const displayQr = qrCodeUrl || "/assests/payment.jpeg";

  const copyUpi = () => {
    navigator.clipboard.writeText(displayUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setScreenshotPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setScreenshotPreview(null);
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 my-4 sm:my-6 font-sans">
      {/* 1. Payment QR Code & Transfer Block */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-950/40 via-black/60 to-black/80 border border-purple-500/30 rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_0_40px_rgba(147,51,234,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Payment Details</h3>
              <p className="text-xs text-white/50">Scan QR Code or copy UPI ID to complete payment</p>
            </div>
          </div>
          {fee > 0 && (
            <div className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm sm:text-base shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Registration Fee: ₹{fee}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* Left: Scannable QR Code Image */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3.5 sm:p-4 bg-black/60 border border-purple-500/25 rounded-2xl shadow-inner group relative">
            <div
              onClick={() => setZoomQr(true)}
              className="relative cursor-pointer overflow-hidden rounded-xl bg-white p-2 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] max-w-[220px] sm:max-w-none w-full flex justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayQr}
                alt="Payment QR Code"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                <span className="text-[10px] sm:text-[11px] font-semibold bg-black/80 text-white px-2.5 py-1 rounded-full shadow">
                  🔍 Click to Enlarge
                </span>
              </div>
            </div>
            <p className="text-[11px] text-purple-300/90 font-medium mt-2.5 text-center flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 flex-shrink-0" /> Scan with GPay, PhonePe, Paytm, or BHIM
            </p>
          </div>

          {/* Right: UPI Copy & Payment Steps */}
          <div className="md:col-span-7 space-y-3.5 sm:space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/50 block">
                UPI ID for Direct Transfer
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-black/50 border border-white/15 rounded-xl p-2.5 focus-within:border-purple-500/60 transition-all">
                <span className="font-mono text-xs sm:text-sm md:text-base text-purple-200 font-bold px-1 sm:px-2 flex-1 break-all sm:truncate">
                  {displayUpi}
                </span>
                <button
                  type="button"
                  onClick={copyUpi}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy UPI
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 sm:p-3.5 text-xs text-white/70 space-y-1.5 sm:space-y-2">
              <p className="font-semibold text-white/90">Steps to finish registration:</p>
              <ol className="list-decimal list-inside space-y-1 text-white/60 leading-relaxed">
                <li>Scan QR Code or transfer <strong className="text-purple-300">₹{fee}</strong> to UPI ID above.</li>
                <li>Copy the <strong>Transaction ID / UTR Number</strong> from your payment receipt.</li>
                <li>Take a clear screenshot of successful payment.</li>
                <li>Upload screenshot & enter Transaction ID below.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Verification Form Fields (Transaction ID & Payment Screenshot) */}
      <div className="bg-gradient-to-b from-black/60 to-black/80 border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Payment Verification Proof</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Transaction ID */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-white/90 block">
              Transaction ID / UTR No. <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              name="transactionId"
              placeholder="e.g. 328409182390 or T2408191530"
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 font-mono transition-all placeholder:text-white/20"
            />
            <p className="text-[10px] sm:text-[11px] text-white/40">Enter the 12-digit UTR or Transaction reference number.</p>
          </div>

          {/* Payment Screenshot Upload Dropzone */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-white/90 block">
              Payment Screenshot Image <span className="text-red-400">*</span>
            </label>

            <div className="relative group">
              <input
                required
                type="file"
                name="paymentScreenshot"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-black/50 border-2 border-dashed border-purple-500/30 group-hover:border-purple-500/60 rounded-xl p-3 sm:p-4 transition-all text-center flex flex-col items-center justify-center min-h-[95px] sm:min-h-[110px]">
                {screenshotPreview ? (
                  <div className="flex items-center gap-3 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={screenshotPreview} alt="Screenshot Preview" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border border-purple-500/40 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{fileName}</p>
                      <span className="text-[10px] text-emerald-400 font-medium">✓ Image Selected (Click to change)</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white/80">
                      Click or drag screenshot here <span className="text-purple-400 font-semibold">(PNG, JPG, max 5MB)</span>
                    </p>
                    {fileName && <p className="text-[10px] sm:text-[11px] text-purple-300 mt-1 font-mono truncate max-w-full">{fileName}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal Zoom */}
      {zoomQr && (
        <div
          onClick={() => setZoomQr(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white p-4 sm:p-5 rounded-2xl max-w-xs sm:max-w-sm w-full text-center shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayQr} alt="Payment QR Code Large" className="w-full max-h-72 sm:max-h-80 object-contain mx-auto rounded-lg" />
            <p className="text-xs text-zinc-700 font-semibold">Scan with any UPI app to pay ₹{fee}</p>
            <button
              type="button"
              onClick={() => setZoomQr(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
