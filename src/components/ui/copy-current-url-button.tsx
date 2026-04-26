"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type CopyCurrentUrlButtonProps = {
  label?: string;
  className?: string;
};

export function CopyCurrentUrlButton({ label = "Compartir", className = "" }: CopyCurrentUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia este enlace", url);
    }
  };

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      <Share2 className="h-4 w-4" />
      {copied ? "Enlace copiado" : label}
    </button>
  );
}
