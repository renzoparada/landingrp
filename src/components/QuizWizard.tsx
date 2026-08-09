"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitLead } from "@/lib/actions/leads";
import PhoneInput from "@/components/PhoneInput";
import { countryNames, defaultCountryIso2, countries } from "@/lib/countries";
import type { SiteConfigData } from "@/lib/types";

export interface WizardQuestion {
  id: string;
  question: string;
  helpText: string | null;
  type: "SINGLE" | "MULTI" | "TEXT";
  options: { label: string; score?: number }[] | null;
  required: boolean;
}

interface QuizWizardProps {
  questions: WizardQuestion[];
  config: Pick<SiteConfigData, "quizIntro" | "brand">;
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

type Stage = "intro" | "quiz" | "contact";

export default function QuizWizard({
  questions,
  config,
  utm,
  referrer,
}: QuizWizardProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textDraft, setTextDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const totalSteps = questions.length + 1; // +1 for contact form
  const progress = useMemo(() => {
    const current = stage === "intro" ? 0 : stage === "contact" ? questions.length : qIndex;
    return Math.round((current / totalSteps) * 100);
  }, [stage, qIndex, questions.length, totalSteps]);

  const currentQuestion = questions[qIndex];

  function goNext() {
    setTextDraft("");
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
    } else {
      setStage("contact");
    }
  }

  function goBack() {
    if (stage === "contact") {
      if (questions.length > 0) {
        setStage("quiz");
        setQIndex(questions.length - 1);
      } else {
        setStage("intro");
      }
      return;
    }
    if (qIndex === 0) {
      setStage("intro");
    } else {
      setQIndex((i) => i - 1);
    }
  }

  function selectSingle(label: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: label }));
    setTimeout(goNext, 200);
  }

  function toggleMulti(label: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const existing = (prev[currentQuestion.id] as string[] | undefined) ?? [];
      const next = existing.includes(label)
        ? existing.filter((l) => l !== label)
        : [...existing, label];
      return { ...prev, [currentQuestion.id]: next };
    });
  }

  function submitText() {
    if (!currentQuestion) return;
    if (currentQuestion.required && !textDraft.trim()) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: textDraft.trim() }));
    goNext();
  }

  function validateContact() {
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
    if (!validateContact()) return;

    setSubmitting(true);
    const result = await submitLead({
      fullName,
      email,
      city,
      country,
      phoneDialCode: phoneDial,
      phoneCountryIso: phoneIso2,
      phoneNumber,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
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
    router.push("/oferta");
  }

  const brandVars = {
    ["--brand-primary" as string]: config.brand.primaryColor,
    ["--brand-secondary" as string]: config.brand.secondaryColor,
  };

  return (
    <div
      style={brandVars}
      className="relative min-h-screen overflow-hidden bg-[#0b0713] flex flex-col"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-blob absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[var(--brand-primary)]/30 blur-[100px]" />
        <div className="animate-float-blob absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[var(--brand-secondary)]/30 blur-[100px]" style={{ animationDelay: "3s" }} />
      </div>

      {/* Progress bar */}
      {stage !== "intro" && (
        <div className="relative z-10 h-1.5 w-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl">
          {stage === "intro" && (
            <div className="animate-fade-up text-center">
              <span className="inline-block rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
                {config.quizIntro.eyebrow}
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-white leading-tight">
                {config.quizIntro.title}
              </h1>
              <p className="mt-4 text-white/70 text-base sm:text-lg">
                {config.quizIntro.subtitle}
              </p>
              <button
                onClick={() =>
                  setStage(questions.length > 0 ? "quiz" : "contact")
                }
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--brand-primary)]/30 transition hover:scale-[1.03] active:scale-95"
              >
                Comenzar
                <span aria-hidden>→</span>
              </button>
              <p className="mt-4 text-xs text-white/40">
                Toma menos de 1 minuto · Tus datos están protegidos
              </p>
            </div>
          )}

          {stage === "quiz" && currentQuestion && (
            <div key={currentQuestion.id} className="animate-fade-up">
              <p className="mb-2 text-sm font-medium text-[var(--brand-secondary)]">
                Pregunta {qIndex + 1} de {questions.length}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </h2>
              {currentQuestion.helpText && (
                <p className="mt-2 text-white/60 text-sm">{currentQuestion.helpText}</p>
              )}

              <div className="mt-6 space-y-3">
                {currentQuestion.type === "SINGLE" &&
                  currentQuestion.options?.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => selectSingle(opt.label)}
                      className={`w-full rounded-xl border px-5 py-4 text-left text-white transition ${
                        answers[currentQuestion.id] === opt.label
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/20"
                          : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}

                {currentQuestion.type === "MULTI" &&
                  currentQuestion.options?.map((opt) => {
                    const selected = (
                      (answers[currentQuestion.id] as string[] | undefined) ?? []
                    ).includes(opt.label);
                    return (
                      <button
                        key={opt.label}
                        onClick={() => toggleMulti(opt.label)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left text-white transition ${
                          selected
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/20"
                            : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]"
                              : "border-white/30"
                          }`}
                        >
                          {selected && "✓"}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}

                {currentQuestion.type === "TEXT" && (
                  <textarea
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    rows={4}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                )}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={goBack}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/5"
                >
                  Atrás
                </button>
                {(currentQuestion.type === "MULTI" ||
                  currentQuestion.type === "TEXT") && (
                  <button
                    onClick={
                      currentQuestion.type === "TEXT" ? submitText : goNext
                    }
                    disabled={
                      currentQuestion.required &&
                      (currentQuestion.type === "TEXT"
                        ? !textDraft.trim()
                        : !((answers[currentQuestion.id] as string[] | undefined) ?? [])
                            .length)
                    }
                    className="flex-1 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-40 hover:scale-[1.02] active:scale-95"
                  >
                    Continuar
                  </button>
                )}
              </div>
            </div>
          )}

          {stage === "contact" && (
            <div className="animate-fade-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                Ya casi terminamos 🎉
              </h2>
              <p className="mt-2 text-white/60 text-sm">
                Completa tus datos para ver tu propuesta personalizada.
              </p>

              <div className="mt-6 space-y-4">
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

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={goBack}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/5"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-6 py-3.5 text-sm font-semibold text-white transition disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                  >
                    {submitting ? "Enviando..." : "Ver mi propuesta →"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
