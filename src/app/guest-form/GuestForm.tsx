/* eslint-disable @typescript-eslint/no-explicit-any */
// app/guest-form/GuestFormClient.tsx
'use client';

import { useState } from 'react';
import { submitGuest } from '@/lib/actions/guest';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export default function GuestFormClient({ uid }: { uid: string }) {
  const [successName, setSuccessName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  // Remove spaces/dashes before sending
  const normalizedPhone = phone.replace(/\s|-/g, '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    if (!formData.get('uid') && uid) formData.set('uid', uid);
    formData.set('phoneNumber', normalizedPhone);

    try {
      const result = await submitGuest(formData);
      if (result.ok) setSuccessName(result.msg);
      else setErrorMsg(result.msg || 'Submission failed');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#091322] px-4 sm:px-6 py-10">
      <div className="w-full max-w-md rounded-[24px] bg-white p-5 sm:p-7 shadow-xl ring-1 ring-slate-100">
        <div className="mb-5">
          <h3 className="text-base sm:text-xl md:text-2xl font-semibold text-[#22384F] leading-snug">
            Personal Information
          </h3>
        </div>

        {successName ? (
          <div className="rounded-md bg-green-50 p-4 text-center animate-fadeIn">
            <p className="text-lg font-semibold text-green-700">
              ✅ Thank you, {successName}!
            </p>
            <p className="text-sm text-green-600 mt-1">
              Your information has been sent successfully.
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-800">
                ❌ {errorMsg}
              </div>
            )}

            {!uid && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 text-xs sm:text-sm text-yellow-800">
                Missing <code>uid</code> in URL — open via a valid QR link.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="uid" value={uid} />

              {/* Full Name */}
              <div>
                <label className="block text-[15px] font-semibold text-[#22384F] mb-1.5">
                  Full Name
                </label>
                <input
                  name="fullName"
                  required
                  placeholder="Enter full name"
                  className="input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[15px] font-semibold text-[#22384F] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  className="input"
                />
              </div>

              {/* Phone (styled like .input) */}
              <div>
                <label className="block text-[15px] font-semibold text-[#22384F] mb-1.5">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="gb" // 🇬🇧 UK
                  value={phone}
                  onChange={setPhone}
                  inputClassName="input"
                  countrySelectorStyleProps={{
                    buttonClassName:
                      'border border-[#E6EEF5] rounded-l-full px-3 py-2 bg-white',
                  }}
                  inputProps={{
                    inputMode: 'tel',
                    autoComplete: 'tel',
                    name: 'phoneNumber',
                    'aria-label': 'Phone number',
                  }}
                />

                {/* Hidden normalized input */}
                <input type="hidden" name="phoneNumber" value={normalizedPhone} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#3D6984] text-white px-4 py-3 text-[16px] font-semibold hover:bg-[#30556A] transition-colors"
              >
                {loading ? 'Submitting…' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
