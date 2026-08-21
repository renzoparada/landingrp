"use client";

import { useState } from "react";

export default function CopyLinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission can fail silently — the link is still shown as
      // plain text so it can be copied manually.
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.target.select()}
        className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <button
        onClick={handleCopy}
        className="shrink-0 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
      >
        {copied ? "¡Copiado! ✓" : "Copiar link"}
      </button>
    </div>
  );
}
