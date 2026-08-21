"use client";

import { useState } from "react";
import { submitLead } from "@/lib/actions/leads";
import PhoneInput from "@/components/PhoneInput";
import { countryNames, defaultCountryIso2, countries } from "@/lib/countries";
import BookingCalendar from "@/components/BookingCalendar";
import type { SiteConfigData } from "@/lib/types";

interface DirectBookingFormProps {
  brand: SiteConfigData["brand"];
  booking: SiteConfigData["booking"];
  initialAvailableDays: { date: string; hasSlots: boolean }[];
  utm: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    utmId?: string;
  };
  referrer?: string;
}

export default function DirectBookingForm({
  brand,
  booking,
  initialAvailableDays,
  utm,
  referrer,
}: DirectBookingFormProps) {
  const [stage, setStage] = useState<"contact" | "calendar">("contact");
  const [leadFirstName, setLeadFirstName] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phoneIso2, setPhoneIso2] = useState(defaultCountryIso2);
  const [phoneDial, setPhoneDial] = useState(
    countries.find((c) => c.iso2 === defaultCountryIso2)?.dial ?? ""
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const brandVars = {
    ["--brand-primary" as string]: brand.primaryColor,
    ["--brand-secondary" as string]: brand.secondaryColor,
  };

  function validate() {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 3) errors.fullName = "Ingresa tu nombre completo";
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Ingresa un correo válido";
    if (city.trim().length < 2) errors.city = "Ingresa tu ciudad";
    if (!country) errors.country = "Selecciona tu país";
    if (phoneNumber.trim().length < 5) errors.phoneNumber = "Ingresa un teléfono válido";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    const result = await submitLead({
      fullName,
      email,
      city,
      country,
      phoneDialCode: phoneDial,
      phoneCountryIso: phoneIso2,
      phoneNumber,
      answers: [],
      landingPath: "/agendar",
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmContent: utm.utmContent,
      utmTerm: utm.utmTerm,
      utmId: utm.utmId,
      referrer,
    });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setLeadFirstName(fullName.trim().split(/\s+/)[0]);
    setStage("calendar");
  }

  if (stage === "calendar") {
    return (
      <BookingCalendar
        initialAvailableDays={initialAvailableDays}
        brand={brand}
        booking={booking}
        leadFirstName={leadFirstName}
      />
    );
  }

  return (
    <div style={brandVars} className="animate-fade-up mx-auto max-w-xl">
      <div className="text-center mb-6">
        <span className="inline-block rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
          {brand.name}
        </span>
        <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-white leading-tight">
          {booking.title}
        </h1>
        <p className="mt-2 text-white/60 text-sm">
          Déjanos tus datos y elige el horario que mejor te acomode.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
          {fieldErrors.fullName && (
            <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.email}</p>
          )}
          <p className="mt-1.5 text-xs text-white/40">
            Te enviaremos un correo para confirmarlo (doble opt-in).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ciudad"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
            {fieldErrors.city && (
              <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.city}</p>
            )}
          </div>
          <div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="" className="bg-[#150d24]">
                País de residencia
              </option>
              {countryNames.map((name) => (
                <option key={name} value={name} className="bg-[#150d24]">
                  {name}
                </option>
              ))}
            </select>
            {fieldErrors.country && (
              <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.country}</p>
            )}
          </div>
        </div>

        <PhoneInput
          iso2={phoneIso2}
          dialCode={phoneDial}
          phoneNumber={phoneNumber}
          onChange={({ iso2, dialCode, phoneNumber: num }) => {
            setPhoneIso2(iso2);
            setPhoneDial(dialCode);
            setPhoneNumber(num);
          }}
          error={fieldErrors.phoneNumber}
        />

        {formError && (
          <p className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-sm text-rose-300">
            {formError}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-6 py-3.5 text-sm font-semibold text-white transition disabled:opacity-50 hover:scale-[1.01] active:scale-95"
        >
          {submitting ? "Enviando..." : "Ver horarios disponibles →"}
        </button>
      </div>
    </div>
  );
}
