"use client";

import { countries, defaultCountryIso2 } from "@/lib/countries";

interface PhoneInputProps {
  iso2: string;
  dialCode: string;
  phoneNumber: string;
  onChange: (value: { iso2: string; dialCode: string; phoneNumber: string }) => void;
  error?: string;
}

export default function PhoneInput({
  iso2,
  dialCode,
  phoneNumber,
  onChange,
  error,
}: PhoneInputProps) {
  const currentIso2 = iso2 || defaultCountryIso2;

  return (
    <div>
      <div className="flex gap-2">
        <select
          aria-label="Código de país"
          value={currentIso2}
          onChange={(e) => {
            const country = countries.find((c) => c.iso2 === e.target.value);
            if (!country) return;
            onChange({ iso2: country.iso2, dialCode: country.dial, phoneNumber });
          }}
          className="w-[124px] shrink-0 rounded-xl bg-white/5 border border-white/15 px-2 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {countries.map((c) => (
            <option key={c.iso2} value={c.iso2} className="bg-[#150d24]">
              {c.flag} +{c.dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="tel"
          placeholder="999 999 999"
          value={phoneNumber}
          onChange={(e) =>
            onChange({
              iso2: currentIso2,
              dialCode: dialCode || countries.find((c) => c.iso2 === currentIso2)?.dial || "",
              phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
            })
          }
          className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
