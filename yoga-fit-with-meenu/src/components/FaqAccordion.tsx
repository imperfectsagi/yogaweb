"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { id: string; question: string; answer: string };

/** Accordion list: one question open at a time, others collapse. Each
 * question is a real <button> (keyboard + screen-reader accessible) with
 * aria-expanded/aria-controls wired to the answer panel. */
export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-white">
      {faqs.map((f) => {
        const isOpen = openId === f.id;
        return (
          <div key={f.id}>
            <h2>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : f.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${f.id}`}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6"
              >
                <span className="text-base font-medium">{f.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted transition-transform duration-200",
                    isOpen && "rotate-180 text-primary"
                  )}
                />
              </button>
            </h2>
            <div
              id={`faq-panel-${f.id}`}
              role="region"
              className={cn("grid overflow-hidden transition-all duration-200 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted sm:px-6">{f.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
