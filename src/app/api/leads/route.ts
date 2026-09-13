import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),
  interested_service: z.string().max(120).optional(),
  preferred_mode: z.string().max(50).optional(),
  preferred_time: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
  // Honeypot field — real users never fill this in; bots often do.
  website: z.string().max(0).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // 5 submissions per 15 minutes per IP is generous for a real visitor but
  // blocks scripted spam floods.
  const limit = await checkRateLimit(`lead:${ip}`, 5, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later, or call/WhatsApp us directly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form — some fields look invalid." },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    // Honeypot tripped — silently pretend success so bots don't learn.
    return NextResponse.json({ ok: true });
  }

  if (!parsed.data.phone && !parsed.data.email) {
    return NextResponse.json(
      { error: "Please provide a phone number or email so we can reach you." },
      { status: 400 }
    );
  }

  await createLead({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || undefined,
    interested_service: parsed.data.interested_service,
    preferred_mode: parsed.data.preferred_mode,
    preferred_time: parsed.data.preferred_time,
    message: parsed.data.message,
    source: "website",
  });

  return NextResponse.json({ ok: true });
}
