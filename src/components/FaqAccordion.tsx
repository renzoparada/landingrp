"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/types";

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const open = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <button
              onClick={() => setOpenId(open ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-white">{faq.question}</span>
              <span
                className={`shrink-0 text-white/50 transition-transform ${open ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            {open && (
              <div className="px-5 pb-4 text-sm text-white/60 leading-relaxed animate-fade-up">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
