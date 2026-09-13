"use client";

import { SITE, whatsappUrl } from "@/lib/utils";
import { Phone, MessageCircle } from "lucide-react";

const DEFAULT_FREE_CLASS_MSG =
  "Hi Meenu, I would like to attend a free yoga class. Please share the details.";

export function MobileCTA({ freeClassMessage }: { freeClassMessage?: string } = {}) {
  // Falls back to the original hardcoded message if no `site_whatsapp_message`
  // has been saved in Admin → Settings → Site Settings, so behavior is
  // unchanged for a site that hasn't set this yet. This is a client
  // component (needs onClick-free but still "use client" for the fixed
  // bottom-bar interactivity elsewhere in the app's conventions), so it
  // can't read the database itself — the message is fetched server-side by
  // whichever page renders this and passed down as a prop.
  const freeClassMsg = freeClassMessage || DEFAULT_FREE_CLASS_MSG;

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
