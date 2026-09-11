"use client";

import { SITE, whatsappUrl } from "@/lib/utils";
import { Phone, MessageCircle } from "lucide-react";

const freeClassMsg =
  "Hi Meenu, I would like to attend a free yoga class. Please share the details.";

export function MobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur safe-area-pb">
      <div className="grid grid-cols-3 gap-1 p-2">
        <a
          href={`tel:${SITE.phone}`}
          className="flex flex-col items-center justify-center gap-0.5 rounded-button py-2 text-xs font-medium text-primary hover:bg-primary/5"
          aria-label="Call"
        >
          <Phone className="h-5 w-5" />
          Call
        </a>
        <a
          href={whatsappUrl(SITE.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 rounded-button py-2 text-xs font-medium text-primary hover:bg-primary/5"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
        <a
          href={whatsappUrl(SITE.whatsapp, freeClassMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 rounded-button bg-primary text-white py-2 text-xs font-medium"
          aria-label="Free Class"
        >
          Free Class
        </a>
      </div>
    </div>
  );
}
