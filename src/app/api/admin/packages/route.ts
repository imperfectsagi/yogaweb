import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminListPackages, adminCreatePackage, type PackageInput } from "@/lib/cms";

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  price: z.number().min(0),
  original_price: z.number().min(0).nullable().optional(),
  currency: z.string().max(10).default("INR"),
  number_of_classes: z.number().int().min(0).nullable().optional(),
  class_duration: z.string().max(50).nullable().optional(),
  package_duration: z.string().max(100).nullable().optional(),
  online_available: z.boolean(),
  offline_available: z.boolean(),
  features: z.array(z.string()).optional(),
  is_popular: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int().default(0),
  cta_text: z.string().max(50).nullable().optional(),
  cta_url: z.string().max(300).nullable().optional(),
  show_on_homepage: z.boolean().optional(),
  homepage_sort_order: z.number().int().optional(),
});

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const packages = await adminListPackages();
  return NextResponse.json({ packages });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  const data: PackageInput = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    original_price: parsed.data.original_price || null,
    currency: parsed.data.currency,
    number_of_classes: parsed.data.number_of_classes ?? null,
    class_duration: parsed.data.class_duration || null,
    package_duration: parsed.data.package_duration || null,
    online_available: parsed.data.online_available ? 1 : 0,
    offline_available: parsed.data.offline_available ? 1 : 0,
    features_json: parsed.data.features?.length ? JSON.stringify(parsed.data.features) : null,
    is_popular: parsed.data.is_popular ? 1 : 0,
    is_active: parsed.data.is_active ? 1 : 0,
    sort_order: parsed.data.sort_order,
    cta_text: parsed.data.cta_text || "Get Started",
    cta_url: parsed.data.cta_url || null,
    show_on_homepage: parsed.data.show_on_homepage ? 1 : 0,
    homepage_sort_order: parsed.data.homepage_sort_order ?? 0,
  };
  const id = await adminCreatePackage(data);
  return NextResponse.json({ ok: true, id });
}
