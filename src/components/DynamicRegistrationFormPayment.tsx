"use client";

const INPUT_CLS =
  "w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono";

const FILE_CLS =
  "w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer";

interface Props {
  fee: number;
  upiId: string | null;
}

export default function DynamicRegistrationFormPayment({ fee, upiId }: Props) {
  return (
    <>
      {/* Payment Instructions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-8 relative">
        <div className="absolute -top-3 left-6 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
          Make Payment ({fee} Rs)
        </div>
        <div className="flex flex-col items-center mt-4 space-y-4">
          <p className="text-white/80 text-sm text-center">
            Scan the QR code below or pay via UPI to complete registration.
          </p>
          {upiId && (
            <p className="text-white/60 text-sm font-mono">UPI ID: {upiId}</p>
          )}
        </div>
      </div>

      {/* Payment Verification */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-8 relative">
        <div className="absolute -top-3 left-6 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
          Payment Verification
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90 block">
              Transaction ID *
            </label>
            <input
              required
              type="text"
              name="transactionId"
              placeholder="e.g. T1234567890"
              className={INPUT_CLS}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90 block">
              Payment Screenshot *
            </label>
            <input
              required
              type="file"
              name="paymentScreenshot"
              accept="image/*"
              className={FILE_CLS}
            />
          </div>
        </div>
      </div>
    </>
  );
}
